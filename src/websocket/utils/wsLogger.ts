/**
 * WS Logger - логирование для dev и prod режимов
 * Task 9 из plan.json
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CompareResult, UpdatePolicy } from './compareStrategies';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const isDev =
  typeof import.meta !== 'undefined'
    ? (import.meta.env?.DEV ?? import.meta.env?.MODE === 'development')
    : process.env.NODE_ENV === 'development';

const LOG_PREFIX = '[WS Smart]';

// ─────────────────────────────────────────────────────────────────────────────
// Dev Logging (подробные логи)
// ─────────────────────────────────────────────────────────────────────────────

export const logEventReceived = (event: string, payloadSize: number): void => {
  if (isDev) {
    console.debug(`${LOG_PREFIX} ← ${event} (${payloadSize} bytes)`);
  }
  logHistory.push({
    type: 'received',
    event,
    payload: { size: payloadSize },
    timestamp: Date.now(),
  });
};

export const logCompareResult = (
  event: string,
  result: CompareResult,
  policy: UpdatePolicy,
): void => {
  if (isDev) {
    const icon = result.shouldUpdate ? '🔄' : '⏭️';
    const stats = result.stats
      ? ` [${result.stats.changedItems}↺ ${result.stats.addedItems}+ ${result.stats.removedItems}-]`
      : '';

    console.debug(
      `${LOG_PREFIX} ${icon} ${event}: ${result.reason} → ${policy}${stats}`,
    );
  }
  logHistory.push({
    type: 'compare',
    event,
    payload: { result, policy },
    timestamp: Date.now(),
  });
};

export const logDispatch = (
  event: string,
  actionType: string,
  itemCount?: number,
): void => {
  if (isDev) {
    const count = itemCount !== undefined ? ` (${itemCount} items)` : '';
    console.debug(`${LOG_PREFIX} ✓ ${event} → dispatch(${actionType})${count}`);
  }
  logHistory.push({
    type: 'dispatch',
    event,
    payload: { actionType, itemCount },
    timestamp: Date.now(),
  });
};

export const logSkip = (event: string, reason: string): void => {
  if (isDev) {
    console.debug(`${LOG_PREFIX} ⏭️ ${event}: skip (${reason})`);
  }
  logHistory.push({
    type: 'skip',
    event,
    payload: { reason },
    timestamp: Date.now(),
  });
};

export const logError = (event: string, error: unknown): void => {
  console.error(`${LOG_PREFIX} ❌ ${event}:`, error);
  logHistory.push({
    type: 'error',
    event,
    payload: error instanceof Error ? error.message : String(error),
    timestamp: Date.now(),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Log History (для дампа)
// ─────────────────────────────────────────────────────────────────────────────

interface LogEntry {
  type:
    | 'received'
    | 'compare'
    | 'dispatch'
    | 'skip'
    | 'error'
    | 'timer'
    | 'timer_influence'
    | 'render';
  event: string;
  payload?: any;
  timestamp: number;
}

const logHistory: LogEntry[] = [];

export const logTimer = (action: string, timeLeft: number, status: string) => {
  if (!isDev) return;
  // console.debug(`${LOG_PREFIX} ⏱️ ${action}: ${timeLeft}s (${status})`);
  logHistory.push({
    type: 'timer',
    event: action,
    payload: { timeLeft, status },
    timestamp: Date.now(),
  });
};

export const logTimerInfluence = (event: string, payload?: any): void => {
  if (isDev) {
    console.debug(`${LOG_PREFIX} ⏱️ ${event}`, payload ?? '');
  }
  logHistory.push({
    type: 'timer_influence',
    event,
    payload,
    timestamp: Date.now(),
  });
};

export const logRender = (
  component: string,
  renderCount: number,
  payload?: any,
): void => {
  if (!isDev) return;
  logHistory.push({
    type: 'render',
    event: component,
    payload: { renderCount, ...(payload ?? {}) },
    timestamp: Date.now(),
  });
};

export const getLogHistory = () => [...logHistory];

export const resetLogHistory = (): void => {
  logHistory.length = 0;
};

export const downloadLogHistory = () => {
  const data = JSON.stringify(logHistory, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `game-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────
// Prod Metrics (агрегированные метрики)
// ─────────────────────────────────────────────────────────────────────────────

interface Metrics {
  totalEvents: number;
  skippedEvents: number;
  upsertEvents: number;
  replaceAllEvents: number;
  errors: number;
}

const metrics: Metrics = {
  totalEvents: 0,
  skippedEvents: 0,
  upsertEvents: 0,
  replaceAllEvents: 0,
  errors: 0,
};

export const recordMetric = (policy: UpdatePolicy): void => {
  metrics.totalEvents++;
  switch (policy) {
    case 'skip':
      metrics.skippedEvents++;
      break;
    case 'upsertMany':
      metrics.upsertEvents++;
      break;
    case 'replaceAll':
      metrics.replaceAllEvents++;
      break;
  }
};

export const recordError = (): void => {
  metrics.errors++;
};

export const getMetrics = (): Readonly<Metrics> => ({ ...metrics });

export const resetMetrics = (): void => {
  metrics.totalEvents = 0;
  metrics.skippedEvents = 0;
  metrics.upsertEvents = 0;
  metrics.replaceAllEvents = 0;
  metrics.errors = 0;
};

/**
 * Вывод сводки метрик (для диагностики)
 */
export const logMetricsSummary = (): void => {
  const skipRate =
    metrics.totalEvents > 0
      ? ((metrics.skippedEvents / metrics.totalEvents) * 100).toFixed(1)
      : '0';

  console.info(
    `${LOG_PREFIX} Metrics:`,
    `total=${metrics.totalEvents}`,
    `skipped=${metrics.skippedEvents} (${skipRate}%)`,
    `upsert=${metrics.upsertEvents}`,
    `replaceAll=${metrics.replaceAllEvents}`,
    `errors=${metrics.errors}`,
  );
};
