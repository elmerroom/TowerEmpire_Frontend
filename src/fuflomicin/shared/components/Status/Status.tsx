import { useSelector } from 'react-redux';
import { getGamePhase, getGameStatus } from '@/store/fuflomicin/fuflSlice';
import {
  FUFL_STATUS_TEXTS,
  GameStatus,
  GamePhase,
  GAME_STATUS,
  GAME_PHASES,
} from '@/fuflomicin/constants';
// import { statusTexts } from '@/shared/constants';
import { selectIsMasterFromCurrentFufl } from '@/entities/player/model';
import { HourglassIcon } from '@/shared/ui/icons/hourglass';
import styles from './Status.module.scss';
import { memo } from 'react';

const getStatusText = (
  status?: GameStatus,
  phase?: GamePhase,
  isMaster?: boolean,
): string => {
  if (status === GAME_STATUS.PAUSED) {
    return FUFL_STATUS_TEXTS.paused ?? 'Пауза';
  }
  if (!phase) {
    return FUFL_STATUS_TEXTS.default ?? 'Игра началась';
  }

  if (phase === GAME_PHASES.REVEAL_SUBMISSIONS && isMaster) {
    return 'Ты ведущий, выбирай карту';
  }

  const fuflText = FUFL_STATUS_TEXTS[phase];
  if (fuflText) {
    return fuflText;
  }

  // const statusText = (statusTexts as Record<string, string>)[phase];
  // if (statusText) {
  //   return statusText;
  // }

  return FUFL_STATUS_TEXTS.default ?? 'Игра началась';
};

interface StatusProps {
  variant?: 'fuflomicin' | 'hff';
}

export const Status = memo(({ variant = 'fuflomicin' }: StatusProps) => {
  const gamePhase = useSelector(getGamePhase);
  const gameStatus = useSelector(getGameStatus);
  const isMaster = useSelector(selectIsMasterFromCurrentFufl);
  const isHff = variant === 'hff';

  return (
    <div className={`${styles.wrap} ${isHff ? styles.hff : ''}`}>
      {isHff ? (
        <HourglassIcon className={styles.icon} />
      ) : (
        <div className={styles.status_dot}></div>
      )}
      <span className={styles.status}>
        {getStatusText(gameStatus, gamePhase, isMaster)}
      </span>
    </div>
  );
});

Status.displayName = 'Status';
