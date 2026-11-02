import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

export const CardUI = ({ type, isCouple, isHideText = false, text }) => {
  return (
    <>
      {!isCouple ? (
        <SimpleBar
          className={`game-card__text game-card__text${'-' + type}`}
          lang="ru"
        >
          {!isHideText && text}
        </SimpleBar>
      ) : (
        <>
          <SimpleBar
            className={`game-card__text game-card__text${'-' + type} game-card__text-couple`}
            lang="ru"
          >
            {!isHideText && text[0]}
          </SimpleBar>
          <hr className="game-card__line" />
          <SimpleBar
            className={`game-card__text game-card__text${'-' + type} game-card__text-couple`}
            lang="ru"
          >
            {!isHideText && text[1]}
          </SimpleBar>
        </>
      )}
    </>
  );
};
