/**
 * Smart Update Middleware - интеллектуальное обновление Redux store
 * Task 4, 5, 6 из plan.json
 *
 * Перехватывает WS actions с meta.wsEvent и применяет стратегии сравнения
 * для минимизации лишних re-renders.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Middleware, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { getEventMeta } from '../registry/wsEventRegistry';
import { validateWsEventPayload } from '@/shared/lib/validation/websocket';
import {
  compare,
  determineUpdatePolicy,
  type CompareResult,
  type UpdatePolicy,
} from '../utils/compareStrategies';
import {
  logCompareResult,
  logSkip,
  logError,
  recordMetric,
  recordError,
} from '../utils/wsLogger';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WsActionMeta {
  /** Тип WS события */
  wsEvent: string;
  /** Timestamp получения события */
  timestamp: number;
  /** Пропустить сравнение и всегда обновить */
  skipCompare?: boolean;
  /** Оригинальный payload до нормализации */
  rawPayload?: unknown;
  /** Результат сравнения (добавляется middleware) */
  compareResult?: CompareResult;
  /** Политика обновления (добавляется middleware) */
  updatePolicy?: UpdatePolicy;
}

interface WsAction extends AnyAction {
  meta?: WsActionMeta;
}

// Action types для smart update
const SMART_UPDATE_ACTION = 'ws/smartUpdate' as const;

// ─────────────────────────────────────────────────────────────────────────────
// Action Creators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Создаёт smart update action с метаданными
 */
export const createSmartUpdateAction = (
  wsEvent: string,
  payload: unknown,
  skipCompare = false,
): WsAction => ({
  type: SMART_UPDATE_ACTION,
  payload,
  meta: {
    wsEvent,
    timestamp: Date.now(),
    skipCompare,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Smart Update Middleware
 *
 * Обрабатывает actions с meta.wsEvent:
 * 1. Получает метаданные события из registry
 * 2. Нормализует payload
 * 3. Сравнивает с текущим состоянием
 * 4. Определяет политику обновления (skip/upsert/replaceAll)
 * 5. Dispatches соответствующий action в target slice
 */
export const smartUpdateMiddleware: Middleware =
  store => next => (action: unknown) => {
    const wsAction = action as WsAction;

    // Проверяем: есть ли метаданные WS события?
    if (!wsAction.meta?.wsEvent) {
      return next(action);
    }

    const { wsEvent, skipCompare } = wsAction.meta;
    const rawPayload = wsAction.payload;

    try {
      // 1. Получаем метаданные события
      const eventMeta = getEventMeta(wsEvent);
      if (!eventMeta) {
        // Не зарегистрировано - пропускаем
        logSkip(wsEvent, 'not registered');
        return next(action);
      }

      // Проверяем, соответствует ли action targetSlice события
      // Если action идет в другой slice, просто пропускаем его без обработки
      const actionSlice = wsAction.type?.split('/')[0];
      const targetSliceMap: Record<string, string> = {
        lobbyPlayers: 'lobbyPlayers',
        gamePlayers: 'gamePlayers',
        gameBj: 'gameBj',
        fuflGame: 'fuflGame',
        currentLobby: 'currentLobby',
        gameSettings: 'gameSettings',
      };
      const actionTargetSlice =
        actionSlice && actionSlice in targetSliceMap
          ? targetSliceMap[actionSlice as keyof typeof targetSliceMap]
          : undefined;

      // Если action идет в другой slice, пропускаем без обработки
      // (нормализация и сравнение применяются только для targetSlice события)
      if (actionTargetSlice && actionTargetSlice !== eventMeta.targetSlice) {
        // Пропускаем action как есть - он идет в другой slice
        return next(wsAction);
      }

      // 2. Нормализуем payload
      const normalizedPayload = eventMeta.normalizer
        ? eventMeta.normalizer(rawPayload)
        : rawPayload;

      const validationResult = validateWsEventPayload(
        wsEvent,
        normalizedPayload,
      );
      if (!validationResult.success) {
        logError(
          wsEvent,
          new Error(`WS payload validation failed: ${validationResult.error}`),
        );
        recordError();
        return;
      }

      // 3. Получаем текущее состояние
      const state = store.getState();
      const currentState = eventMeta.selector
        ? eventMeta.selector(state as any)
        : undefined;
      const validatedPayload = validationResult.data;

      // 4. Сравниваем если не skipCompare
      let compareResult: CompareResult;
      if (skipCompare || eventMeta.compareStrategy === 'always') {
        compareResult = { shouldUpdate: true, reason: 'always' };
      } else {
        compareResult = compare(validatedPayload, currentState, {
          strategy: eventMeta.compareStrategy,
          idField: eventMeta.idField,
          versionField: eventMeta.versionField,
        });
      }

      // 5. Определяем политику обновления
      const policy = determineUpdatePolicy(compareResult);
      logCompareResult(wsEvent, compareResult, policy);
      recordMetric(policy);

      // 6. Если skip - не dispatch'им дальше
      if (policy === 'skip') {
        logSkip(wsEvent, compareResult.reason);
        return;
      }

      // 7. Dispatch оригинального action с нормализованным payload
      // Handlers уже имеют логику для конкретных слайсов,
      // поэтому пропускаем action дальше
      const enhancedAction: WsAction = {
        ...wsAction,
        payload: validatedPayload,
        meta: {
          ...wsAction.meta,
          compareResult,
          updatePolicy: policy,
        },
      };

      return next(enhancedAction);
    } catch (error) {
      logError(wsEvent, error);
      recordError();
      // В случае ошибки - пропускаем action как есть
      return next(action);
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
// Helper для handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Обёртка для dispatch в handlers - добавляет WS meta
 */
export const dispatchWithWsMeta = (
  dispatch: Dispatch,
  wsEvent: string,
  action: AnyAction,
  skipCompare = false,
): void => {
  dispatch({
    ...action,
    meta: {
      ...(action as any).meta,
      wsEvent,
      timestamp: Date.now(),
      skipCompare,
    },
  });
};

/**
 * Проверяет, нужно ли пропустить обновление на основе meta
 */
export const shouldSkipUpdate = (action: WsAction): boolean => {
  const meta = action.meta;
  if (!meta?.updatePolicy) return false;
  return meta.updatePolicy === 'skip';
};

export default smartUpdateMiddleware;
