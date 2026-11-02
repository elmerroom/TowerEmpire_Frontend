/**
 * Модуль содержит функции валидации для полей формы настроек игры
 */

/**
 * Валидирует время раунда
 * @param {number|string} value - значение времени раунда
 * @returns {number} - валидированное значение в диапазоне 10-100
 */
export const validateRoundTime = value => {
  const parsed = Number(value);
  if (isNaN(parsed)) return 10;
  return Math.max(10, Math.min(100, Math.round(parsed)));
};

export const applyRoundTimeStep = value => {
  return Math.round(value / 5) * 5;
};

/**
 * Валидирует баллы для победы с учетом текущих баллов игроков
 * @param {number|string} value - значение баллов для победы
 * @param {Object} players - объект игроков из store
 * @returns {number} - валидированное значение в диапазоне [minValue, 999]
 */
export const validateRoundPoints = (value, players = {}) => {
  const parsed = Number(value);
  if (isNaN(parsed) || !value.toString().trim()) return 10;
  const rounded = Math.round(parsed);
  const maxPlayersPoints = getMaxPlayersPoints(players);
  const minValue = maxPlayersPoints > 0 ? maxPlayersPoints + 1 : 2;
  return Math.max(minValue, Math.min(999, rounded));
};

/**
 * Находит максимальное количество баллов среди всех игроков
 * @param {Object} players - объект игроков из store
 * @returns {number} - максимальное количество баллов
 */
export const getMaxPlayersPoints = players => {
  if (!players || Object.keys(players).length === 0) return 0;
  let maxPoints = 0;
  Object.values(players).forEach(player => {
    if (player.points > maxPoints) {
      maxPoints = player.points;
    }
  });
  return maxPoints;
};

/**
 * Определяет минимально возможное значение очков для победы
 * @param {Object} players - объект игроков из store
 * @returns {number} - минимальное значение очков для победы
 */
export const getMinScoreToWin = players => {
  const maxPlayerPoints = getMaxPlayersPoints(players);
  return maxPlayerPoints > 0 ? maxPlayerPoints + 2 : 2;
};
