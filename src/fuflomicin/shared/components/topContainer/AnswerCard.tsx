import { memo } from 'react';
import styles from './AnswerCard.module.scss';

type AnswerCardProps = {
  cardId: string;
  playerId: string;
  phrase?: string;
  flipped: boolean;
  isSelected: boolean;
  backgroundIndex: number;
  imagePath: string;
};

export const AnswerCard = memo(
  ({
    cardId,
    playerId,
    phrase,
    flipped,
    isSelected,
    backgroundIndex,
    imagePath,
  }: AnswerCardProps) => {
    const frontBg = `/img/${imagePath}/cards/front/${backgroundIndex}.webp`;
    const backBg = `/img/${imagePath}/cards/back/${backgroundIndex}.webp`;

    return (
      <div
        className={`${styles.card} ${flipped ? styles.flipped : ''} ${
          isSelected ? styles.selected : ''
        }`}
        data-card-id={cardId}
        data-player-id={playerId}
        role="button"
        aria-pressed={flipped}
        tabIndex={0}
      >
        <div
          className={styles.cardFront}
          style={{ backgroundImage: `url('${backBg}')` }}
        ></div>
        <div
          className={styles.cardBack}
          style={{ backgroundImage: `url('${frontBg}')` }}
        >
          <span className={styles.cardLabel}>{phrase || 'Ответ'}</span>
        </div>
      </div>
    );
  },
);
