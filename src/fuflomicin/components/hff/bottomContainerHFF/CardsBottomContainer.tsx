import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getWordsCurrentPlayer,
  getGamePhase,
  getMasterId,
} from '@/store/fuflomicin/fuflSlice';
import { getUserId } from '@/entities/user/model/slice';
import { selectGamePlayerIdByUserId } from '@/entities/player/model/gamePlayerSlice';
import { GAME_PHASES } from '@/fuflomicin/constants';
import { wsManager } from '@/websocket/WsManager';
import type { RootState } from '@/store/store';
import { Card } from './Card';
import styles from './CardsBottomContainer.module.scss';

const MAX_SELECTED = 4;

interface CardsBottomContainerProps {
  handleSelectCard: (evt: React.MouseEvent<HTMLDivElement>) => void;
  chatSlot?: React.ReactNode;
}

export const CardsBottomContainer = ({
  handleSelectCard,
  chatSlot,
}: CardsBottomContainerProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const cards = useSelector(getWordsCurrentPlayer);
  const gamePhase = useSelector(getGamePhase);
  const masterId = useSelector(getMasterId);
  const userId = useSelector(getUserId);
  const myGamePlayerId = useSelector((state: RootState) =>
    selectGamePlayerIdByUserId(state, userId),
  );

  const isMaster = Number(myGamePlayerId) === Number(masterId);
  const isSubmissionPhase = gamePhase === GAME_PHASES.PLAYER_SUBMISSION;
  const canInteract = isSubmissionPhase && !isMaster && !hasSubmitted;

  useEffect(() => {
    if (gamePhase === GAME_PHASES.PLAYER_SUBMISSION) {
      setHasSubmitted(false);
      setSelectedIds(new Set());
    }
  }, [gamePhase]);

  const toggleCard = useCallback(
    (cardId: string) => {
      if (!canInteract) return;
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(cardId)) {
          next.delete(cardId);
        } else if (next.size < MAX_SELECTED) {
          next.add(cardId);
        }
        return next;
      });
    },
    [canInteract],
  );

  const handleSubmit = useCallback(() => {
    if (!canInteract || selectedIds.size < 2) return;

    const selectedCards = cards
      .filter(card => selectedIds.has(card.id))
      .map((card, index) => ({
        card_id: Number(card.id),
        order: index + 1,
        word: card.variants?.[0] ?? '',
      }));

    wsManager.send({
      command: 'check_choice_player_card_fm',
      selected_cards: selectedCards,
      version: 'TM',
    });

    setHasSubmitted(true);
    setSelectedIds(new Set());
  }, [canInteract, selectedIds, cards]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.bottomContainer} onClick={handleSelectCard}>
        {cards.map((card, idx) => (
          <div
            key={card.id ?? idx}
            className={styles.cardWrapper}
            onClick={() => toggleCard(card.id)}
          >
            <Card
              cardId={String(card.id)}
              playerId={String(myGamePlayerId ?? '')}
              isSelected={selectedIds.has(card.id)}
              text={card.variants?.[0] ?? ''}
              disabled={!canInteract}
            />
          </div>
        ))}
      </div>
      <div className={styles.actionButtons}>
        <div className={styles.actionGroup}>
          <button
            className={styles.actionBtn}
            onClick={e => {
              e.stopPropagation();
              handleSubmit();
            }}
            disabled={!canInteract || selectedIds.size < 2}
            title="Отправить"
          >
            <img src="/img/hff/send.svg" alt="Отправить" />
          </button>
          <button
            className={styles.actionBtn}
            onClick={e => {
              e.stopPropagation();
              setSelectedIds(new Set());
            }}
            disabled={!canInteract || selectedIds.size === 0}
            title="Отменить выбор"
          >
            <img src="/img/hff/close.svg" alt="Отменить" />
          </button>
        </div>
        {chatSlot}
      </div>
    </div>
  );
};
