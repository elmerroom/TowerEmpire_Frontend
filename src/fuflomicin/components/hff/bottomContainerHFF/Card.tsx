import { memo } from 'react';
import styles from './Card.module.scss';

type CardProps = {
  cardId: string;
  playerId: string;
  text?: string;
  isSelected: boolean;
  disabled?: boolean;
};

export const Card = memo(
  ({ cardId, playerId, text, isSelected, disabled }: CardProps) => {
    return (
      <div
        className={`${styles.card} ${isSelected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        <div className={styles.cardLabelImage}>
          <div className={styles.cardLabel}>{text || 'Ответ'}</div>
        </div>
      </div>
    );
  },
);
