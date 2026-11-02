import { useSelector } from 'react-redux';
import { CardUI } from './card_ui/card_ui';
import {
  selectGameStatus,
  selectPhase,
} from '@/entities/game/model/gameBjSlice';
import { selectIsMasterFromCurrent } from '@/entities/player/model';
import {
  STATUS_RUNNING,
  PHASE_PLAYER_CHOICE,
  PHASE_MASTER_CHOICE,
  PHASE_INTERMISSION,
  PHASE_ALL_SELECTED_PLAYER_CARD,
} from '@/entities/game/model/events';

export const Card = ({ card, type, isMasterSelected = false }) => {
  const gameStatus = useSelector(selectGameStatus);
  const gamePhase = useSelector(selectPhase);
  const isMaster = useSelector(selectIsMasterFromCurrent);

  const isCouple = () => card.text && card.text.includes('/');
  const text = () => {
    let resultText = [];
    if (isCouple()) {
      resultText = card.text.split('/');
    } else resultText.push(card.text);
    return resultText;
  };

  // Определяем доступность взаимодействия:
  // - bottom: обычный игрок (не master) при running + player_choice
  // - top: master при master_choice, или всем при intermission (победитель показан)
  const isPlayerChoiceActive =
    (gameStatus === STATUS_RUNNING && gamePhase === PHASE_PLAYER_CHOICE) ||
    (gameStatus === STATUS_RUNNING &&
      gamePhase === PHASE_ALL_SELECTED_PLAYER_CARD);
  const isMasterChoiceActive =
    gameStatus === STATUS_RUNNING && gamePhase === PHASE_MASTER_CHOICE;
  const isIntermission = gamePhase === PHASE_INTERMISSION;

  let directionOption = false;
  if (type === 'top') {
    directionOption = (isMaster && isMasterChoiceActive) || isIntermission;
  } else if (type === 'bottom') {
    directionOption = !isMaster && isPlayerChoiceActive;
  }

  return (
    <li
      id={card.id || card.card_id}
      className={`
      game-card 
      ${card.chosen ? 'game-card_chosen' : ''}
      ${isMasterSelected ? 'game-card_master-selected' : ''}
      game-card${'_' + type}
      game-card${'_' + type}${directionOption ? '_enabled' : '_disabled'}
      ${isCouple() ? 'game-card_top_couple' : ''}
      `}
    >
      <div
        className={`
        game-card__cover
        game-card__cover${'_' + type}${directionOption ? '_enabled' : '_disabled'}
        `}
      />
      <CardUI type={type} isCouple={isCouple()} text={text()} />
    </li>
  );
};
