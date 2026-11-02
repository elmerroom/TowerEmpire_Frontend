/**
 * Определяет текущий и следующий ранг пользователя на основе его опыта и заданных уровней.
 * @param {number} exp - Текущий опыт пользователя.
 * @param {Array<{rank: string, subRank: string, xp: number}>} rankLevels - Уровни рангов (отсортированы по возрастанию опыта).
 * @returns {{
 *   currentRank: string,
 *   currentSubRank: string,
 *   currentRankXp: number,
 *   nextRank: string|null,
 *   nextSubRank: string|null,
 *   nextRankXp: number|null,
 *   xpNeededForNext: number
 * }} Информация о рангах.
 * @example
 * const rankLevels = [
 *    { rank: 'Новичок', subRank: 'I', xp: 0 },
 *    { rank: 'Новичок', subRank: 'II', xp: 50 },
 * ];
 * getRankInfo(30, rankLevels); // { currentRank: 'Новичок', currentSubRank: 'I', currentRankXp: 30, nextRank: 'Новичок', nextSubRank: 'II', nextRankXp: 50, xpNeededForNext: 20 }
 */

export const getRankInfo = (exp, rankLevels) => {
  // Находим первый индекс, где exp < rankLevels[i].xp
  const index = rankLevels.findIndex(level => exp < level.xp);

  // Если вообще не нашли такого (exp >= последнего порога), значит у пользователя самый топовый ранг
  if (index === -1) {
    const last = rankLevels[rankLevels.length - 1];
    return {
      currentRank: last.rank,
      currentSubRank: last.subRank,
      currentRankXp: last.xp,

      // Нет следующего ранга, достигнут максимум
      nextRank: null,
      nextSubRank: null,
      nextRankXp: null,
      xpNeededForNext: 0,
    };
  }

  // Если exp меньше, чем порог самого первого уровня:
  // Считаем, что пользователь находится на первой уровне и не дотянул до порога
  if (index === 0) {
    const first = rankLevels[0];
    return {
      currentRank: first.rank,
      currentSubRank: first.subRank,
      currentRankXp: first.xp,

      nextRank: first.rank,
      nextSubRank: first.subRank,
      nextRankXp: first.xp,
      xpNeededForNext: first.xp - exp,
    };
  }

  // Иначе index > 0
  // Текущий ранг = "предыдущая запись" в массиве
  // Следующий ранг = "текущая запись" в массиве
  const currentLevel = rankLevels[index - 1];
  const nextLevel = rankLevels[index];

  return {
    currentRank: currentLevel.rank,
    currentSubRank: currentLevel.subRank,
    currentRankXp: currentLevel.xp,

    nextRank: nextLevel.rank,
    nextSubRank: nextLevel.subRank,
    nextRankXp: nextLevel.xp,
    xpNeededForNext: nextLevel.xp - exp,
  };
};
