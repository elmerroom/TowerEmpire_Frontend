import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { ModalWithWinnerCardUI } from './ui/modal_with_winner_card_ui';

import {
  getRoundWinner,
  getGamePhase,
  getSubmissions,
  getShowSelectedCards,
} from '../../../store/fuflomicin/fuflSlice';
import { selectAllGamePlayers } from '@/entities/player/model/gamePlayerSlice';
import { GAME_PHASES } from '@/fuflomicin/constants/gamePhase';

export const ModalWithWinnerCard = () => {
  const roundWinner = useSelector(getRoundWinner);
  const players = useSelector(selectAllGamePlayers);
  const submissions = useSelector(getSubmissions);
  const selectedCards = useSelector(getShowSelectedCards);
  const gamePhase = useSelector(getGamePhase);
  const gameMode = useSelector((state: any) => state.modal.gameMode);
  const isHff = gameMode === 'hff';
  const modalClass =
    gameMode === 'fuflomicin' || gameMode === 'hff'
      ? 'fufl-modal'
      : gameMode
        ? 'game-modal'
        : '';

  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);

  const winnerText = useMemo(() => {
    if (!roundWinner) return '';
    // Если есть text
    if (roundWinner.text) {
      return roundWinner.text;
    }
    // Если нет, ищем имя через selectedCards
    if (selectedCards && roundWinner.id in selectedCards) {
      return selectedCards[roundWinner.id];
    }

    return '';
  }, [roundWinner, submissions]);

  // roundWinner is AnswerCardWire, need to find player who owns this card
  // roundWinner.id is card_id, not player_id
  const roundWinnerName = useMemo(() => {
    if (!roundWinner) return 'Неизвестный игрок';
    // Если есть имя
    if (roundWinner.player_name) {
      return roundWinner.player_name;
    }

    const text = roundWinner.text || selectedCards?.[roundWinner.id];
    if (!text) return 'Неизвестный игрок';

    // Находим имя по text
    const found = Object.entries(submissions).find(
      ([, sub]) => sub.phrase === text,
    );

    if (found) {
      const playerId = Number(found[0]);
      const player = players.find(p => Number(p.id) === playerId);
      return player?.name ?? 'Неизвестный игрок';
    }
    return 'Неизвестный игрок';
  }, [roundWinner, submissions, players, selectedCards]);

  // 4 sec timer for modal animation
  useEffect(() => {
    if (gamePhase !== GAME_PHASES.REVEAL_MASTER_SELECTION) return;
    setShowWinnerOverlay(true);

    const timer = setTimeout(() => {
      setShowWinnerOverlay(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [roundWinner, gamePhase]);

  return (
    <AnimatePresence>
      {showWinnerOverlay && (
        <UniversalModal
          isOpen={showWinnerOverlay}
          onClose={() => setShowWinnerOverlay(false)}
          closeOnOverlay={true}
          className={modalClass}
        >
          <ModalWithWinnerCardUI
            winner={{
              name: roundWinnerName,
              text: winnerText,
            }}
            isHff={isHff}
          />
        </UniversalModal>
      )}
    </AnimatePresence>
  );
};
