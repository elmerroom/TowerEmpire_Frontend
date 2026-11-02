import { useEffect, useRef, memo } from 'react';
import { useSelector } from 'react-redux';
import { animate as frameMotionAnimate } from 'framer-motion';
import { selectPhase } from '../../../entities/game/model/gameBjSlice';
import { useGameTimer } from '../../../entities/game/model/GameTimerContext';

export const TimeLine = memo(({ ClassName }) => {
  const divRef = useRef(null);
  const gamePhase = useSelector(selectPhase);
  const { progress } = useGameTimer();

  useEffect(() => {
    if (divRef.current) {
      const targetWidth = progress > 0 ? progress : 0;

      // Императивная анимация через прямое обновление CSS переменной - не вызывает перерендер
      frameMotionAnimate(
        divRef.current,
        { '--after-width': `${targetWidth}%` },
        { duration: 1, ease: 'linear' },
      );
    }
  }, [progress]);

  return (
    <div
      className={`${ClassName}__time-line ${gamePhase === 'all_selected_player_card' ? 'timeline_pulse' : ''}`}
      ref={divRef}
    />
  );
});

TimeLine.displayName = 'TimeLine';
