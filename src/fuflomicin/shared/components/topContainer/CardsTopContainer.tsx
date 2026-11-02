import styles from './CardsTopContainer.module.scss';
import { AnswerCard } from './AnswerCard';
import { CardData } from '@/fuflomicin/types/cards';

interface CardsTopContainerProps {
  imagePath: string;
  allChosenCards?: CardData[];
  isFlippedPhase: boolean;
  selectedCardId: number | null;
  handleSelectCard: (evt: React.MouseEvent<HTMLDivElement>) => void;
}

const getBackgroundIndex = (imagePath: string, idx: number) => {
  if (imagePath === 'hff') return 1; // same image for all cards for hff
  return (idx % 11) + 1; // unique images for fm
};

export const CardsTopContainer = ({
  imagePath,
  allChosenCards = [],
  isFlippedPhase,
  selectedCardId,
  handleSelectCard,
}: CardsTopContainerProps) => {
  if (allChosenCards.length === 0) return null;

  return (
    <div className={styles.cardsTop} onClick={handleSelectCard}>
      {allChosenCards.map((card, idx) => (
        <AnswerCard
          key={card.playerId ?? idx}
          cardId={String(card.card_id)}
          playerId={String(card.playerId)}
          phrase={card.phrase}
          flipped={isFlippedPhase}
          isSelected={
            selectedCardId != null &&
            card.playerId != null &&
            Number(card.playerId) === Number(selectedCardId)
          }
          backgroundIndex={getBackgroundIndex(imagePath, idx)}
          imagePath={imagePath}
        />
      ))}
    </div>
  );
};
