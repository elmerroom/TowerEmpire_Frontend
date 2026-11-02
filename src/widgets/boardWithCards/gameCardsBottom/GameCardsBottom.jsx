import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { GameCardsBottomUI } from './gameCardsBottomUI';
import {
  toggleChosenCard,
  selectChosenCardsCurrentPlayer,
  selectCountOfAnswers,
} from '../../../entities/game/model/gameBjSlice';
import {
  STATUS_RUNNING,
  PHASE_PLAYER_CHOICE,
  PHASE_ALL_SELECTED_PLAYER_CARD,
} from '../../../entities/game/model/events';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { selectIsMasterFromCurrent } from '@/entities/player/model';

export const GameCardsBottom = ({ currentUser, gameStatus, gamePhase }) => {
  const { send } = useWebSocket();
  const dispatch = useDispatch();
  const isMaster = useSelector(selectIsMasterFromCurrent);

  const chosenCards = useSelector(selectChosenCardsCurrentPlayer, shallowEqual);
  const countOfAnswers = useSelector(selectCountOfAnswers);

  const handleSelectCard = useCallback(
    evt => {
      if (
        gameStatus !== STATUS_RUNNING ||
        (gamePhase !== PHASE_PLAYER_CHOICE &&
          gamePhase !== PHASE_ALL_SELECTED_PLAYER_CARD) ||
        isMaster
      ) {
        return;
      }
      const target = evt.target.closest('.game-card');
      if (!target) return;

      const cardId = Number(target.id);

      // Вычисляем следующий выбор (toggle)
      const isAlreadyChosen = chosenCards.includes(cardId);
      let nextChosen;
      if (isAlreadyChosen) {
        nextChosen = chosenCards.filter(id => id !== cardId);
      } else if (chosenCards.length >= countOfAnswers) {
        nextChosen = [cardId];
      } else {
        nextChosen = [...chosenCards, cardId];
      }

      dispatch(toggleChosenCard(cardId));

      if (nextChosen.length === countOfAnswers) {
        const payload = {
          command: 'check_choice_player_card',
          selected_cards: nextChosen.map((id, idx) => ({
            card_id: id,
            order: idx + 1,
          })),
        };

        send(payload);
      }
    },
    [
      gameStatus,
      gamePhase,
      isMaster,
      chosenCards,
      countOfAnswers,
      dispatch,
      send,
    ],
  );

  const cards = currentUser?.cards;
  const cardsWithChosen = useMemo(
    () =>
      cards?.map(c => ({
        ...c,
        chosen: chosenCards.includes(Number(c.id || c.card_id)),
      })) ?? [],
    [cards, chosenCards],
  );

  const commonProps = useMemo(
    () => ({
      cards: cardsWithChosen,
      handleSelectCard,
    }),
    [cardsWithChosen, handleSelectCard],
  );

  if (!currentUser) return null;

  return <GameCardsBottomUI {...commonProps} />;
};
