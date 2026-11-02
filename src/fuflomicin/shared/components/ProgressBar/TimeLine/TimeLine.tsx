import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  getMasterTime,
  getRoundTime,
} from '../../../../features/gameSettings/model/gameSettingsSlice';
import {
  getGamePhase,
  getTimerTime,
} from '../../../../store/slices/game/gameSlice';
import styles from './TimeLine.module.scss';

export const TimeLine = () => {
  const timeLineRef = useRef<HTMLDivElement>(null);
  const gamePhase = useSelector(getGamePhase);
  const roundTime = useSelector(getRoundTime);
  const masterTime = useSelector(getMasterTime);
  const timerTime = useSelector(getTimerTime);
  const maxTime = gamePhase === 'show_selected_cards' ? masterTime : roundTime;

  useEffect(() => {
    if (timeLineRef.current) {
      const widthPercentage = ((timerTime - 0.2) / (maxTime - 0.2)) * 100;
      timeLineRef.current.style.setProperty(
        '--after-width',
        `${widthPercentage ? widthPercentage : 0}%`,
      );
    }
  }, [timerTime, maxTime]);

  return (
    <div
      className={`${styles.timeLine} ${gamePhase === 'all_selected_player_card' ? styles.pulse : ''}`}
      ref={timeLineRef}
    />
  );
};
