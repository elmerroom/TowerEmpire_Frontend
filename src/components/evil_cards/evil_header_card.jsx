import { useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { selectQuestion } from '../../entities/game/model/gameBjSlice';
import { Button } from '../../shared/ui/Button';

export const HeaderCard = () => {
  const question = useSelector(selectQuestion);

  return (
    <div className="d-flex flex-column align-items-center justify-content-between h-100">
      <div className="d-flex flex-row flex-wrap justify-content-between align-items-center w-100">
        <div className="logo"></div>
        <div className="commercial__mobile d-flex justify-content-between gap-1 w-50">
          <a
            href="https://discord.gg/bYjdJsK5ZH"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="commercial__btn-discord" />
          </a>
          <a
            href="https://boosty.to/towerdragon/donate"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="commercial__btn-boosty" />
          </a>
        </div>
      </div>
      {/* Карточка с вопросом */}
      <div className="game-card-evil">
        <SimpleBar className="game-card-evil__wrapper">
          {question ? (
            <p className="game-card-evil__text">{question.text}</p>
          ) : (
            <p className="game-card-evil__text">
              Ожидаем начала нового раунда...
            </p>
          )}
        </SimpleBar>
      </div>
    </div>
  );
};
