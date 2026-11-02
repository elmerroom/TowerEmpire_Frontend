import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  getSubmissions,
  getGameStatus,
  getGamePhase,
  setSelectedCardId,
  getMasterId,
  getSelectedCardId,
} from '@/store/fuflomicin/fuflSlice';
import { useWebSocket } from '@/store/contexts/WsRootProvider';
import { GAME_PHASES, GAME_STATUS } from '@/fuflomicin/constants';
import type { RootState } from '@/store/store';
import { getUserId } from '@/entities/user/model/slice';
import { selectGamePlayerIdByUserId } from '@/entities/player/model/gamePlayerSlice';
import { CardData } from '../types/cards';

export const useHFFCards = () => {
  const dispatch = useDispatch();
  const { send } = useWebSocket();

  const submissions = useSelector(getSubmissions);
  const gameStatus = useSelector(getGameStatus);
  const gamePhase = useSelector(getGamePhase);
  const masterId = useSelector(getMasterId);
  const selectedCardId = useSelector(getSelectedCardId);
  const userId = useSelector(getUserId);
  const myGamePlayerId = useSelector((state: RootState) =>
    selectGamePlayerIdByUserId(state, userId),
  );

  const allChosenCards: CardData[] = Object.entries(submissions)
    .filter(([playerId]) =>
      masterId == null ? true : Number(playerId) !== Number(masterId),
    )
    .map(([playerId, sub]) => ({
      card_id: sub.card_id || `temp_${playerId}`,
      playerId: Number(playerId),
      phrase: sub.phrase,
    }));

  const isFlippedPhase =
    gamePhase === GAME_PHASES.REVEAL_SUBMISSIONS ||
    gamePhase === GAME_PHASES.REVEAL_MASTER_SELECTION;

  const handleSelectCard = useCallback(
    (evt: React.MouseEvent<HTMLDivElement>) => {
      const isMaster = Number(myGamePlayerId) === Number(masterId);

      if (
        gameStatus !== GAME_STATUS.RUNNING ||
        gamePhase !== GAME_PHASES.REVEAL_SUBMISSIONS ||
        !isMaster
      )
        return;

      const target = (evt.target as HTMLElement).closest(
        '[data-player-id]',
      ) as HTMLElement | null;
      if (!target) return;

      const playerIdAttr = target.getAttribute('data-player-id');
      if (!playerIdAttr) return;

      const cardIdAttr = target.getAttribute('data-card-id');
      const playerId = Number(playerIdAttr);
      if (Number.isNaN(playerId)) return;

      let cardId = cardIdAttr != null ? Number(cardIdAttr) : Number.NaN;
      if (Number.isNaN(cardId)) cardId = playerId;

      send({
        command: 'check_choice_master_winner_fm',
        player_id: playerId,
        card_id: cardId,
      });
      dispatch(setSelectedCardId(playerId));
    },
    [dispatch, send, gamePhase, gameStatus, myGamePlayerId, masterId],
  );

  return {
    allChosenCards,
    isFlippedPhase,
    selectedCardId,
    masterId,
    handleSelectCard,
  };
};
