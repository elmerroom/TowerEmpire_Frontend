import { memo } from 'react';
import { useSelector } from 'react-redux';
import {
  getTimerTime,
  getGamePhase,
} from '../../../../store/slices/game/gameSlice';
import styles from './Time.module.scss';

export const Time = memo(() => {
  const timerTime = useSelector(getTimerTime);
  const gamePhase = useSelector(getGamePhase);
  const currentSeconds = Math.ceil(timerTime - 0.2);

  return (
    <div
      className={`${styles.time} ${gamePhase === 'all_selected_player_card' ? styles.pulse : ''}`}
    >
      {currentSeconds > 0 ? (
        <p className={styles.timeText}>
          {currentSeconds}
          <span className={styles.unit}>c</span>
        </p>
      ) : null}
    </div>
  );
});

Time.displayName = 'Time';
