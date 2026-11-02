import { Card } from '../../../shared/card/card';
import { Arrow } from '../../../shared/arrow/arrow';

export const GameCardsBottomUI = ({ cards, handleSelectCard }) => {
  return (
    <div className="bottom-container">
      <Arrow direction="left" />
      <div className="card-bottom chat-relative">
        <ul className="card__bottom" onClick={evt => handleSelectCard(evt)}>
          {cards && cards.length > 0
            ? cards.map((card, index) => (
                <Card key={index} card={card} type={'bottom'} />
              ))
            : Array.from({ length: 10 }).map((_, idx) => (
                // Skeleton when there're no cards
                <div className="game-card" key={idx} />
              ))}
        </ul>
      </div>
      <Arrow direction="right" />
    </div>
  );
};
