import { CatAnimator } from '../../../features/animation/ui/CatAnimator';
import { Card } from '../../../shared/card/card';

export const GameCardsTopUI = ({
  allChosenCards,
  handleSelectCard,
  masterSelectedCardId,
}) => {
  return (
    <div className="card-container">
      <ul onClick={handleSelectCard} className="card__top">
        {allChosenCards.map((card, index) => (
          <Card
            key={index}
            card={card}
            type={'top'}
            isMasterSelected={
              masterSelectedCardId !== null &&
              Number(card.id || card.card_id) === Number(masterSelectedCardId)
            }
          />
        ))}
      </ul>
      <CatAnimator />
    </div>
  );
};
