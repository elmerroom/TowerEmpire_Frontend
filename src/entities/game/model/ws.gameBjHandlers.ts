// src/entities/game-bj/model/ws.gameBjHandlers.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { wsManager } from '@/websocket/WsManager';
import type { AppDispatch } from '@/store/store';
import {
  setStarted,
  applyStartRound,
  setPhasePlayerChoice,
  setCommentator,
  setAllSelectedCountdown,
  setShowSelectedCards,
  setEndPhasePlayerChoice,
  setPhaseMasterChoice,
  setWinner,
  setFinishGame,
  setPaused,
  setResumed,
  setTimerTime,
  setIsTimerRun,
  reset as resetGameBj,
} from './gameBjSlice';
import { dispatchWithWsMeta } from '@/websocket/middleware/smartUpdateMiddleware';
import { upsertMany as gameUpsertMany } from '@/entities/player/model/gamePlayerSlice';
import { createGameCommonHandlers } from './ws.gameCommonHandlers';

// Smart update logging
import { logEventReceived, recordMetric } from '@/websocket/utils/wsLogger';
import { closeModal } from '@/store/modalSlice';

/** Handler context the WsManager passes into each handler */
export type Ctx = {
  dispatch: AppDispatch;
  getState: () => any;
  ws: typeof wsManager;
};

// ─────────────────────────────────────────────────────────────────────────────
// Game BJ handlers with logging
// ─────────────────────────────────────────────────────────────────────────────

const gameBjHandlers = {
  ...createGameCommonHandlers({
    resetGameState: resetGameBj as any,
    onPause: () => setPaused(),
    onResume: () => setResumed(),
  }),
  /** start_game */
  start_game({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('start_game', JSON.stringify(m).length);
    recordMetric('replaceAll'); // Always apply

    if (m?.game_id != null) {
      dispatch(
        setStarted({
          game_id: Number(m.game_id),
          timestamp: m.timestamp ?? null,
        }),
      );
    }
  },

  /** start_round */
  start_round({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('start_round', JSON.stringify(m).length);
    recordMetric('replaceAll');

    const playersNorm: Array<{
      id: number;
      user_id: number;
      selected_cards: any[];
    }> = (Array.isArray(m?.players) ? m.players : []).map((p: any) => ({
      id: Number(p.id),
      selected_cards: Array.isArray(p.selected_cards)
        ? p.selected_cards.map((c: any) => {
            // card_id может быть на верхнем уровне или в card.id
            const cardId = Number(c?.card_id ?? c?.card?.id ?? c?.id ?? 0);
            // text находится в card.text (приоритет), или может быть на верхнем уровне
            const cardText = c?.card?.text ?? c?.text ?? '';
            return {
              id: Number(c?.id ?? 0),
              player_id: Number(c?.player_id ?? p.id),
              card_id: cardId,
              is_table: Boolean(c?.is_table),
              is_winner: Boolean(c?.is_winner),
              text: cardText,
            };
          })
        : [],
      user_id: Number(p.user_id),
    }));

    // master_id с бэка — это game player id (id записи игрока в игре).
    // Используем master_id напрямую, так как это уже правильный game player id
    const normalizedMasterId = Number(m.master_id);

    // Сначала синхронизируем игроков
    if (Array.isArray(m?.players)) {
      dispatch(gameUpsertMany(m.players as any));
    }

    // Затем обновляем состояние игры с правильным master_id
    dispatch(
      applyStartRound({
        current_round: Number(m.current_round),
        master_id: normalizedMasterId,
        card: m.card,
        players: playersNorm,
      }),
    );
  },

  /** start_phase_player_choice_card */
  start_phase_player_choice_card({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('start_phase_player_choice_card', 0);
    recordMetric('replaceAll');

    dispatch(setTimerTime(Number(m?.time_round ?? 0)));
    dispatch(setIsTimerRun(true));
    dispatch(setPhasePlayerChoice());
  },

  /** commentator (note: comes as "type": "commentator") */
  commentator({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('commentator', JSON.stringify(m).length);
    recordMetric('replaceAll');

    if (m?.text) dispatch(setCommentator({ text: String(m.text) }));
  },

  /**
   * card_selection - Прогресс выбора карт игроком (ответ сервера)
   * Содержит player_cards и counter
   */
  card_selection({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('card_selection', JSON.stringify(m).length);
    recordMetric('replaceAll');
    // Событие информационное (counter показывает сколько игроков выбрали).
    // При необходимости можно сохранять counter в store.
    // Пока просто логируем - UI обновится при show_selected_cards.
    console.debug(
      '[card_selection] counter:',
      m?.counter,
      'player_cards:',
      m?.player_cards?.length ?? 0,
    );
  },

  /**
   * master_selected_cards - Мастер выбрал карту-победителя (информативное)
   * Событие приходит до end_phase_master_choice
   */
  master_selected_cards({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('master_selected_cards', JSON.stringify(m).length);
    recordMetric('replaceAll');
    // Информативное событие - фактический выбор придёт в end_phase_master_choice
    console.debug('[master_selected_cards] user_id:', m?.user_id);
  },

  /** show_selected_cards */
  show_selected_cards({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('show_selected_cards', JSON.stringify(m).length);
    recordMetric('replaceAll');

    const cards = (m && m.cards) || {};

    dispatch(setShowSelectedCards({ cards }));
    dispatch(setPhaseMasterChoice());
  },

  /** end_phase_player_choice_card */
  end_phase_player_choice_card({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('end_phase_player_choice_card', 0);
    recordMetric('replaceAll');

    dispatch(setIsTimerRun(false));
    dispatch(setEndPhasePlayerChoice());
  },

  /** start_phase_master_choice */
  start_phase_master_choice({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('start_phase_master_choice', 0);
    recordMetric('replaceAll');

    dispatch(setTimerTime(Number(m?.time_round ?? 0)));
    dispatch(setIsTimerRun(true));
    dispatch(setPhaseMasterChoice());
  },

  /** end_phase_master_choice */
  end_phase_master_choice({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('end_phase_master_choice', JSON.stringify(m).length);
    recordMetric('replaceAll');

    if (m?.winner) {
      dispatch(setWinner({ winner: m.winner }));
    } else {
      dispatch(setPhaseMasterChoice());
    }
    dispatch(setIsTimerRun(false));
  },

  /** finish_game */
  finish_game({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('finish_game', JSON.stringify(m).length);
    recordMetric('replaceAll');

    sessionStorage.setItem('gameFinished', 'true');
    const lobbyId = getState()?.currentLobby?.lobby?.id;
    if (lobbyId != null) {
      sessionStorage.setItem('finishedLobbyId', String(lobbyId));
    }

    dispatch(closeModal('modalWaitingForPlayers'));

    const users = Array.isArray(m?.users) ? m.users : [];
    dispatch(setIsTimerRun(false));
    dispatch(
      setFinishGame({
        timestamp: m.timestamp ?? null,
        users,
      }),
    );
  },
  /** all_selected_player_card */
  all_selected_player_card({ dispatch }: Ctx, m: any) {
    logEventReceived('all_selected_player_card', JSON.stringify(m).length);
    dispatchWithWsMeta(
      dispatch,
      'all_selected_player_card',
      setAllSelectedCountdown(m),
    );
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────────────────────

export function registerGameBjHandlers() {
  // Key matches lobby activation: wsManager.activateGroup(`game:${payload.gameType}`)
  wsManager.registerGroup('game:bj', gameBjHandlers);
}
