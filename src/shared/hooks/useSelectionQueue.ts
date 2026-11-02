import { useState, useCallback, useMemo } from 'react';

/**
 * Чистая функция: переключает значение в массиве с лимитом.
 * - Если `value` уже есть — удаляет.
 * - Иначе: если очередь заполнена — очищает и добавляет `value` первым.
 * - Иначе — добавляет `value` в конец.
 *
 * @param queue текущий массив
 * @param value значение для toggle
 * @param limit максимальный размер очереди
 * @returns новый массив
 */
export function toggleWithLimit<T>(queue: T[], value: T, limit: number): T[] {
  const idx = queue.indexOf(value);
  if (idx !== -1) {
    // Удаляем
    return [...queue.slice(0, idx), ...queue.slice(idx + 1)];
  }
  if (queue.length >= limit) {
    // Очередь заполнена — сброс и начинаем заново
    return [value];
  }
  return [...queue, value];
}

export interface UseSelectionQueueReturn<T> {
  /** Текущий выбор */
  queue: T[];
  /** Размер очереди */
  size: number;
  /** Первый элемент */
  first: T | undefined;
  /** Последний элемент */
  last: T | undefined;
  /** Toggle: добавляет/удаляет элемент с учётом лимита */
  toggle: (value: T) => void;
  /** Очистить выбор */
  clear: () => void;
  /** Полностью заменить массив */
  set: (values: T[]) => void;
}

/**
 * Хук для toggle-выбора с лимитом (по мотивам useQueue).
 * @param limit максимальное количество выбранных элементов
 * @param initial начальное значение (по умолчанию пустой массив)
 */
export function useSelectionQueue<T>(
  limit: number,
  initial: T[] = [],
): UseSelectionQueueReturn<T> {
  const [queue, setQueue] = useState<T[]>(initial);

  const toggle = useCallback(
    (value: T) => {
      setQueue(q => toggleWithLimit(q, value, limit));
    },
    [limit],
  );

  const clear = useCallback(() => setQueue([]), []);
  const set = useCallback((values: T[]) => setQueue(values), []);

  return useMemo(
    () => ({
      queue,
      size: queue.length,
      first: queue[0],
      last: queue[queue.length - 1],
      toggle,
      clear,
      set,
    }),
    [queue, toggle, clear, set],
  );
}
