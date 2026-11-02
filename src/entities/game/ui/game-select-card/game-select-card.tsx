import React, { ReactNode } from 'react';
import styles from './game-select-card.module.scss';

export interface GameSelectCardProps {
  title: string;
  description: string;
  image: string;
  isSelected?: boolean;
  onClick?: () => void;
  extraActions?: ReactNode;
}

/**
 * GameSelectCard Component
 * Represents a single game card for selection in the lobby.
 * Entities layer (FSD)
 */
export const GameSelectCard: React.FC<GameSelectCardProps> = ({
  title,
  description,
  image,
  isSelected,
  onClick,
  extraActions,
}) => {
  return (
    <div
      className={`${styles.game} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className={styles.game__card}>
        <img className={styles.game__card_img} src={image} alt={title} />
        <div>
          {extraActions && (
            <div
              className={styles.gameBtns}
              onClick={e => e.stopPropagation()} // Prevent card selection when clicking buttons
            >
              {extraActions}
            </div>
          )}
          <h6 className={styles.subtitle}>{title}</h6>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};
