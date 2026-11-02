import { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import {
  selectGameStatus,
  selectPhase,
  selectHandDetailedForPlayer,
} from '../../entities/game/model/gameBjSlice';
import { getUserId } from '../../entities/user/model/slice';
import {
  selectCurrentPlayerId,
  selectCurrentPlayer,
} from '@/entities/player/model/currentPlayerSlice';
import { selectGamePlayerIdByUserId } from '@/entities/player/model/gamePlayerSlice';
import { selectIsMasterFromCurrent } from '@/entities/player/model';
import { GameCardsTop } from './gameCardsTop/gameCardsTop';
import { GameCardsBottom } from './gameCardsBottom/GameCardsBottom';

export const BoardWithCards = ({ position = 'bottom' }) => {
  const userId = useSelector(getUserId);
  const lobbyPlayerId = useSelector(selectCurrentPlayerId);
  const gamePlayerId = useSelector(state =>
    selectGamePlayerIdByUserId(state, userId),
  );
  const playerId = gamePlayerId ?? lobbyPlayerId;

  const currentUser = useSelector(selectCurrentPlayer);
  const playerCards = useSelector(
    state => selectHandDetailedForPlayer(state, playerId),
    shallowEqual,
  );

  const isMaster = useSelector(selectIsMasterFromCurrent);

  const gameStatus = useSelector(selectGameStatus);
  const gamePhase = useSelector(selectPhase);

  const currentUserWithCards = useMemo(() => {
    if (!currentUser) return null;

    const result = {
      ...currentUser,
      isMaster,
    };

    if (playerCards) {
      result.cards = playerCards;
    }

    return result;
  }, [currentUser, playerCards, isMaster]);

  const commonProps = useMemo(
    () => ({
      currentUser: currentUserWithCards,
      gameStatus,
      gamePhase,
    }),
    [currentUserWithCards, gameStatus, gamePhase],
  );
  return (
    <>
      {position === 'bottom' && <GameCardsBottom {...commonProps} />}
      {position === 'top' && <GameCardsTop {...commonProps} />}
    </>
  );
};
