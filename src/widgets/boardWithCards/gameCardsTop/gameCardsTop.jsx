import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useGamePhaseSounds } from '../../../features/sounds/hooks/useGamePhaseSounds';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { GameCardsTopUI } from './gameCardsTopUI';
import {
  selectAllChosenCards,
  selectMasterSelectedCardId,
  setMasterSelectedCard,
} from '../../../entities/game/model/gameBjSlice';

export const GameCardsTop = ({ currentUser, gameStatus, gamePhase }) => {
  const allChosenCards = useSelector(selectAllChosenCards, shallowEqual);
  const masterSelectedCardId = useSelector(selectMasterSelectedCardId);
  const { send } = useWebSocket();
  const dispatch = useDispatch();
  useGamePhaseSounds({ game: 'bj' });

  const handleSelectCard = useCallback(
    evt => {
      if (
        gameStatus !== 'running' ||
        gamePhase !== 'master_choice' ||
        !currentUser ||
        !currentUser.isMaster
      ) {
        return;
      }

      const target = evt.target.closest('.game-card');

      if (target) {
        const targetId = Number(target.id);

        dispatch(setMasterSelectedCard(targetId));

        send({
          command: 'check_choice_master_winner',
          card_id: targetId,
        });
      }
    },
    [gameStatus, gamePhase, currentUser, send, dispatch],
  );

  const commonProps = useMemo(
    () => ({
      allChosenCards,
      handleSelectCard,
      masterSelectedCardId,
    }),
    [allChosenCards, handleSelectCard, masterSelectedCardId],
  );

  return <GameCardsTopUI {...commonProps} />;
};
