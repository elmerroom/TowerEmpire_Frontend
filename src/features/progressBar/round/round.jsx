import { statusTexts } from '../../../shared/constants';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import {
  selectGameStatus,
  selectPhase,
  selectCurrentRound,
} from '../../../entities/game/model/gameBjSlice';
import { selectIsMasterFromCurrent } from '@/entities/player/model';

export const Round = memo(({ className }) => {
  const gamePhase = useSelector(state => selectPhase(state));
  const gameStatus = useSelector(state => selectGameStatus(state));
  const isMaster = useSelector(selectIsMasterFromCurrent);
  const currentRound = useSelector(selectCurrentRound);
  const getStatusText = (gameStatus, gamePhase) => {
    if (gameStatus === 'paused') {
      return statusTexts.paused; // Если игра на паузе, возвращаем "Игра на паузе"
    }
    if (gamePhase === 'master_choice' && isMaster) {
      return 'Ты ведущий, выбирай карту';
    }
    return statusTexts[gamePhase] || statusTexts.default; // Иначе возвращаем текст по фазе
  };
  return (
    <div className={`${className}__round`}>
      <div className={`${className}__round--wrap`}>
        {currentRound && <h6>Раунд {currentRound}:&nbsp;&nbsp;</h6>}
        <span>{getStatusText(gameStatus, gamePhase)}</span>
      </div>
    </div>
  );
});

Round.displayName = 'Round';
