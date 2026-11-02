import { memo } from 'react';
import { useSelector } from 'react-redux';
import { selectPhase } from '../../../entities/game/model/gameBjSlice';
import { useGameTimer } from '../../../entities/game/model/GameTimerContext';

export const Time = memo(({ className }) => {
  const gamePhase = useSelector(selectPhase);
  const { timeLeft } = useGameTimer();

  return (
    <div
      className={`${className}__time ${gamePhase === 'all_selected_player_card' ? 'pulse' : ''}`}
    >
      {timeLeft > 0 ? (
        <p>
          {timeLeft}
          <span>c</span>
        </p>
      ) : null}
    </div>
  );
});

Time.displayName = 'Time';
