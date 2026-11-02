import { useEffect } from 'react';
import { useTimer } from '../helpers/hooks';
import styles from './waitingTimer.module.scss';

export const WaitingTimer = ({ endTimestamp }: { endTimestamp: number }) => {
  const { minutes, seconds, restart } = useTimer(0, {
    immediately: false,
  });

  useEffect(() => {
    const remainingSeconds = Math.max(
      0,
      Math.ceil((endTimestamp - Date.now()) / 1000),
    );

    restart(remainingSeconds, true);
  }, [endTimestamp, restart]);

  return (
    <div className={styles.timer}>
      {minutes}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
