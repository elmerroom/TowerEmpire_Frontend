import type { RootState } from '@/store/store';
import { getUserId } from '@/entities/user/model/slice';
import { selectMasterId } from '@/entities/game/model/gameBjSlice';
import { getMasterId as getFuflMasterId } from '@/store/fuflomicin/fuflSlice';
import { selectGamePlayerIdByUserId } from './gamePlayerSlice';

/**
 * Текущий gamePlayer.id для авторизованного пользователя (в рамках активной игры).
 * Важно: это НЕ user_id, а id записи игрока в конкретной игре (BJ/FUF).
 */
export const selectMyGamePlayerId = (state: RootState): number | null => {
  const userId = getUserId(state);
  return selectGamePlayerIdByUserId(state, userId);
};

/**
 * Является ли текущий пользователь ведущим (master) текущего раунда BJ.
 * masterId приходит как game player id и меняется каждый раунд.
 */
export const selectIsMasterFromCurrent = (state: RootState): boolean => {
  const masterId = selectMasterId(state as any);
  const myGamePlayerId = selectMyGamePlayerId(state);

  // Если masterId или myGamePlayerId не определены, пользователь не является ведущим
  if (masterId == null || myGamePlayerId == null) {
    return false;
  }

  // Сравниваем как числа для надежности
  const masterIdNum = Number(masterId);
  const myGamePlayerIdNum = Number(myGamePlayerId);

  // Дополнительная проверка: если значения не являются валидными числами, возвращаем false
  if (!Number.isFinite(masterIdNum) || !Number.isFinite(myGamePlayerIdNum)) {
    return false;
  }

  return masterIdNum === myGamePlayerIdNum;
};

/**
 * Является ли текущий пользователь ведущим (master) текущего раунда
 * Фуфломицина/Найма по Фану (оба используют общий fuflSlice).
 * masterId приходит как game player id и меняется каждый раунд.
 */
export const selectIsMasterFromCurrentFufl = (state: RootState): boolean => {
  const masterId = getFuflMasterId(state as any);
  const myGamePlayerId = selectMyGamePlayerId(state);

  if (masterId == null || myGamePlayerId == null) {
    return false;
  }

  const masterIdNum = Number(masterId);
  const myGamePlayerIdNum = Number(myGamePlayerId);

  if (!Number.isFinite(masterIdNum) || !Number.isFinite(myGamePlayerIdNum)) {
    return false;
  }

  return masterIdNum === myGamePlayerIdNum;
};
