import { useSelector } from 'react-redux';
import { ModalWithWinnerCardUI } from './ui/modal_with_winner_card_ui';
import {
  selectRoundWinner,
  selectHandsDetailedByPlayer,
  selectAllChosenCards,
  selectPhase,
} from '../../../../entities/game/model/gameBjSlice';
import { selectAllGamePlayers } from '@/entities/player/model/gamePlayerSlice';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UniversalModal } from '@/shared/universal-modal/UniversalModal';

export const ModalWithWinnerCard = () => {
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const roundWinner = useSelector(selectRoundWinner);
  const players = useSelector(selectAllGamePlayers);
  const handsDetailedByPlayer = useSelector(selectHandsDetailedByPlayer);
  const chosenCardsAllPlayers = useSelector(selectAllChosenCards);
  const gamePhase = useSelector(selectPhase);
  const gameMode = useSelector(state => state.modal.gameMode);
  const modalClass =
    gameMode === 'fuflomicin' ? 'fufl-modal' : gameMode ? 'game-modal' : '';
  // roundWinner is AnswerCardWire, need to find player who owns this card
  // roundWinner.id is card_id, not player_id
  const winnerUser = () => {
    if (!roundWinner) return null;

    // First, try to find card in handsDetailedByPlayer
    let playerId = null;

    // Search in handsDetailedByPlayer
    for (const [, cards] of Object.entries(handsDetailedByPlayer)) {
      const foundCard = cards.find(
        card => Number(card.card_id) === Number(roundWinner.id),
      );
      if (foundCard) {
        playerId = Number(foundCard.player_id);
        break;
      }
    }

    // If not found, try chosenCardsAllPlayers
    if (playerId === null) {
      const foundCardGroup = chosenCardsAllPlayers.find(
        cardGroup =>
          Number(cardGroup.card_id) === Number(roundWinner.id) ||
          cardGroup.cards.some(
            card => Number(card.card_id) === Number(roundWinner.id),
          ),
      );
      if (foundCardGroup) {
        playerId = Number(foundCardGroup.playerId);
      }
    }

    // Find player by player_id
    if (playerId !== null) {
      return players.find(player => Number(player.id) === playerId) || null;
    }

    return null;
  };

  // Найти все карты победителя из chosenCardsAllPlayers
  const getAllWinnerCards = () => {
    if (!roundWinner) return [];

    const winnerPlayerId = winnerUser()?.id;
    if (!winnerPlayerId) return [];

    // Найти группу карт победителя
    const winnerCardGroup = chosenCardsAllPlayers.find(
      cardGroup => Number(cardGroup.playerId) === Number(winnerPlayerId),
    );

    if (winnerCardGroup && winnerCardGroup.cards) {
      // Вернуть все карты победителя, отсортированные по порядку
      return winnerCardGroup.cards.map(card => ({
        text: card.text,
        card_id: card.card_id,
      }));
    }

    // Если не найдено в chosenCardsAllPlayers, вернуть хотя бы одну карту из roundWinner
    return roundWinner.text
      ? [{ text: roundWinner.text, card_id: roundWinner.id }]
      : [];
  };

  const winnerCards = getAllWinnerCards();
  const winner = {
    name: winnerUser() ? winnerUser().name : 'Неизвестный игрок',
    cards: winnerCards,
    // Для обратной совместимости с UI компонентом
    isCouple:
      winnerCards.length > 1 ||
      (roundWinner?.text ? roundWinner.text.includes('/') : false),
  };

  const text = () => {
    // Если есть несколько карт, вернуть их тексты
    if (winnerCards.length > 1) {
      return winnerCards.map(card => card.text);
    }

    // Если одна карта, проверить, является ли она парной (содержит '/')
    if (roundWinner?.text) {
      if (roundWinner.text.includes('/')) {
        return roundWinner.text.split('/');
      }
      return [roundWinner.text];
    }

    return [];
  };

  winner.text = text();

  useEffect(() => {
    // Show modal when there's a winner and phase is 'intermission' or 'end_phase_master_choice'
    // After setWinner, phase becomes 'intermission', so we check for both phases
    if (
      !roundWinner ||
      (gamePhase !== 'end_phase_master_choice' && gamePhase !== 'intermission')
    ) {
      return;
    }
    setShowWinnerOverlay(true);

    const timer = setTimeout(() => {
      setShowWinnerOverlay(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [roundWinner?.id]);

  return (
    <AnimatePresence>
      {showWinnerOverlay && (
        <UniversalModal
          isOpen={showWinnerOverlay}
          onClose={() => setShowWinnerOverlay(false)}
          closeOnOverlay={true}
          className={modalClass}
        >
          <ModalWithWinnerCardUI winner={winner} />
        </UniversalModal>
      )}
    </AnimatePresence>
  );
};
