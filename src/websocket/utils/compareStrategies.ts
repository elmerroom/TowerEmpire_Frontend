/**
 * Compare Strategies Module - стратегии сравнения для умного обновления
 * Task 2, 5 из plan.json
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CompareStrategy } from '../registry/wsEventRegistry';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CompareResult {
  /** Нужно ли обновлять store */
  shouldUpdate: boolean;
  /** Причина решения */
  reason:
    | 'identical'
    | 'version_bump'
    | 'fingerprint_diff'
    | 'deep_diff'
    | 'always'
    | 'no_current';
  /** Статистика для логирования */
  stats?: {
    totalItems: number;
    changedItems: number;
    addedItems: number;
    removedItems: number;
  };
}

export interface CompareOptions {
  strategy: CompareStrategy;
  idField?: string;
  versionField?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fingerprint Strategy (для players - быстрый O(n) хеш)
// ─────────────────────────────────────────────────────────────────────────────

type PlayerFingerprint = readonly [
  number, // id
  number, // user_id
  string, // name
  number, // is_host (0|1)
  number, // is_disconnect (0|1)
  number, // points
  string, // avatar
  string, // nickname_color
  number, // is_vip (0|1)
];

const numberOrZero = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const booleanToInt = (value: unknown): 0 | 1 => (value ? 1 : 0);

const stringOrEmpty = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return String(value);
};

/**
 * Создаёт fingerprint для игрока - компактное представление ключевых полей
 */
const createPlayerFingerprint = (p: any): PlayerFingerprint => [
  numberOrZero(p?.id ?? p?.user_id),
  numberOrZero(p?.user_id),
  stringOrEmpty(p?.name),
  booleanToInt(p?.is_host),
  booleanToInt(p?.is_disconnect),
  numberOrZero(p?.points),
  stringOrEmpty(p?.avatar),
  stringOrEmpty(p?.nickname_color),
  booleanToInt(p?.is_vip),
];

/**
 * Создаёт хеш для массива fingerprints
 */
const hashFingerprints = (fingerprints: PlayerFingerprint[]): string => {
  // Сортируем по ID для стабильного сравнения
  const sorted = [...fingerprints].sort((a, b) => a[0] - b[0]);
  return JSON.stringify(sorted);
};

/**
 * Сравнение по fingerprint - быстрое O(n)
 */
export const compareFingerprintArray = (
  incoming: any[],
  current: any[],
  idField: string = 'id',
): CompareResult => {
  if (!Array.isArray(current) || current.length === 0) {
    return {
      shouldUpdate: true,
      reason: 'no_current',
      stats: {
        totalItems: incoming.length,
        changedItems: 0,
        addedItems: incoming.length,
        removedItems: 0,
      },
    };
  }

  const incomingFingerprints = incoming.map(createPlayerFingerprint);
  const currentFingerprints = current.map(createPlayerFingerprint);

  const incomingHash = hashFingerprints(incomingFingerprints);
  const currentHash = hashFingerprints(currentFingerprints);

  if (incomingHash === currentHash) {
    return {
      shouldUpdate: false,
      reason: 'identical',
      stats: {
        totalItems: incoming.length,
        changedItems: 0,
        addedItems: 0,
        removedItems: 0,
      },
    };
  }

  // Подсчёт изменений для статистики
  const currentById = new Map(current.map(p => [numberOrZero(p[idField]), p]));
  const incomingById = new Map(
    incoming.map(p => [numberOrZero(p[idField]), p]),
  );

  let changed = 0;
  let added = 0;
  let removed = 0;

  for (const [id, incomingPlayer] of incomingById) {
    const currentPlayer = currentById.get(id);
    if (!currentPlayer) {
      added++;
    } else {
      const inFp = createPlayerFingerprint(incomingPlayer);
      const curFp = createPlayerFingerprint(currentPlayer);
      if (JSON.stringify(inFp) !== JSON.stringify(curFp)) {
        changed++;
      }
    }
  }

  for (const id of currentById.keys()) {
    if (!incomingById.has(id)) {
      removed++;
    }
  }

  return {
    shouldUpdate: true,
    reason: 'fingerprint_diff',
    stats: {
      totalItems: incoming.length,
      changedItems: changed,
      addedItems: added,
      removedItems: removed,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Version Strategy (для gameBj - по номеру раунда/версии)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Сравнение по версии/timestamp
 */
export const compareByVersion = (
  incoming: any,
  current: any,
  versionField: string,
): CompareResult => {
  if (current == null) {
    return { shouldUpdate: true, reason: 'no_current' };
  }

  const incomingVersion = incoming?.[versionField];
  const currentVersion = current?.[versionField];

  if (incomingVersion == null || currentVersion == null) {
    // Fallback to deep compare
    return compareDeep(incoming, current);
  }

  const inV =
    typeof incomingVersion === 'number'
      ? incomingVersion
      : String(incomingVersion);
  const curV =
    typeof currentVersion === 'number'
      ? currentVersion
      : String(currentVersion);

  if (inV === curV) {
    return { shouldUpdate: false, reason: 'identical' };
  }

  // Для чисел проверяем что incoming >= current
  if (typeof inV === 'number' && typeof curV === 'number') {
    if (inV > curV) {
      return { shouldUpdate: true, reason: 'version_bump' };
    }
    // inV < curV - возможно stale data, пропускаем
    return { shouldUpdate: false, reason: 'identical' };
  }

  return { shouldUpdate: true, reason: 'version_bump' };
};

// ─────────────────────────────────────────────────────────────────────────────
// Deep Strategy (fallback - полное глубокое сравнение)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Быстрое глубокое сравнение
 */
export const compareDeep = (incoming: any, current: any): CompareResult => {
  if (current == null) {
    return { shouldUpdate: true, reason: 'no_current' };
  }

  // Быстрый путь - JSON stringify
  try {
    const incomingStr = JSON.stringify(incoming);
    const currentStr = JSON.stringify(current);

    if (incomingStr === currentStr) {
      return { shouldUpdate: false, reason: 'identical' };
    }
  } catch {
    // Fallback - всегда обновляем если не можем сравнить
    return { shouldUpdate: true, reason: 'deep_diff' };
  }

  return { shouldUpdate: true, reason: 'deep_diff' };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Compare Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Основная функция сравнения - выбирает стратегию и применяет
 */
export const compare = (
  incoming: unknown,
  current: unknown,
  options: CompareOptions,
): CompareResult => {
  const { strategy, idField = 'id', versionField } = options;

  switch (strategy) {
    case 'always':
      return { shouldUpdate: true, reason: 'always' };

    case 'fingerprint':
      if (Array.isArray(incoming)) {
        return compareFingerprintArray(incoming, current as any[], idField);
      }
      // Fallback to deep for non-arrays
      return compareDeep(incoming, current);

    case 'version':
      if (versionField) {
        return compareByVersion(incoming, current, versionField);
      }
      // Fallback to deep if no version field
      return compareDeep(incoming, current);

    case 'deep':
    default:
      return compareDeep(incoming, current);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update Policy
// ─────────────────────────────────────────────────────────────────────────────

export type UpdatePolicy = 'skip' | 'upsertMany' | 'replaceAll';

/**
 * Определяет политику обновления на основе результата сравнения
 * Task 6: Политики применения обновлений
 */
export const determineUpdatePolicy = (result: CompareResult): UpdatePolicy => {
  if (!result.shouldUpdate) {
    return 'skip';
  }

  const stats = result.stats;
  if (!stats) {
    // Нет статистики - безопасный replaceAll
    return 'replaceAll';
  }

  const { totalItems, changedItems, addedItems, removedItems } = stats;

  // Если удалены элементы - нужен replaceAll
  if (removedItems > 0) {
    return 'replaceAll';
  }

  // Если изменено/добавлено > 50% - replaceAll
  const changedTotal = changedItems + addedItems;
  if (totalItems > 0 && changedTotal / totalItems > 0.5) {
    return 'replaceAll';
  }

  // Иначе upsertMany для точечных обновлений
  if (changedTotal > 0) {
    return 'upsertMany';
  }

  return 'skip';
};
