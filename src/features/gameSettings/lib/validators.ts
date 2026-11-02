/**
 * Модуль содержит функции валидации для полей формы настроек игры
 */

/**
 * Валидирует время раунда
 * @param value - значение времени раунда
 * @returns валидированное значение в диапазоне 10-100
 */
export const validateRoundTime = (value: number | string): number => {
  const parsed = Number(value);
  if (isNaN(parsed)) return 10;
  return Math.max(10, Math.min(100, Math.round(parsed)));
};

export const applyRoundTimeStep = (value: number | string): number => {
  const parsed = Number(value);
  if (isNaN(parsed)) return 10;
  return Math.round(parsed / 5) * 5;
};

interface PlayerWithPoints {
  points?: number;
}

/**
 * Валидирует баллы для победы с учетом текущих баллов игроков
 * @param value - значение баллов для победы
 * @param players - объект или Map игроков из store
 * @returns валидированное значение в диапазоне [minValue, 999]
 */
export const validateRoundPoints = (
  value: number | string,
  players: PlayerWithPoints[] = [],
): number => {
  const parsed = Number(value);
  if (isNaN(parsed) || !String(value).trim()) return 10;
  const rounded = Math.round(parsed);
  const minValue = getMinScoreToWin(players);
  return Math.max(minValue, Math.min(999, rounded));
};

/**
 * Находит максимальное количество баллов среди всех игроков
 * @param players - объект или Map игроков из store
 * @returns максимальное количество баллов
 */
export const getMaxPlayersPoints = (players: PlayerWithPoints[]): number => {
  if (!players) return 0;

  let maxPoints = 0;

  players.forEach(player => {
    const points = player?.points ?? 0;
    if (points > maxPoints) {
      maxPoints = points;
    }
  });

  return maxPoints;
};

/**
 * Определяет минимально возможное значение очков для победы
 * @param players - объект или Map игроков из store
 * @returns минимальное значение очков для победы
 */
export const getMinScoreToWin = (players: PlayerWithPoints[]): number => {
  const maxPlayerPoints = getMaxPlayersPoints(players);
  return maxPlayerPoints > 0 ? maxPlayerPoints + 2 : 2;
};
