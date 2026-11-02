import { PlayerFinalCard } from '@/shared/player-final-card/PlayerFinalCard';
import { Button } from '@/shared/ui/Button';

export const ModalWithResultUI = ({
  leaveTime,
  options,
  handlers,
  players,
  isHost,
  variant,
}) => {
  const formatGameDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '0:00:00';
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const diffMs = Math.max(0, endMs - startMs);
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const modifierClass = variant ? `modal-main__result--${variant}` : '';

  return (
    <div className={`modal-main__result ${modifierClass}`}>
      <div className="modal-main__result__header">
        <h6 className="modal-main__result__header_result">Результаты</h6>
        <div className="modal-main__result__header_separator"></div>
        <h5 className="modal-main__result__header_congrat">Спасибо за игру!</h5>
        <p className="modal-main__result__header_duration">
          Продолжительность игры{' '}
          {formatGameDuration(options.startGameTime, options.endGameTime)}
        </p>
      </div>
      <div className="modal-main__result__content">
        <ul className="modal-main__result__content_players">
          {players.map((player, index) => (
            <PlayerFinalCard
              key={index}
              player={player}
              position={index + 1}
              isWinner={index === 0 ? true : false}
            ></PlayerFinalCard>
          ))}
        </ul>
      </div>
      <p className="modal-main__result__info">
        Автовыход через {leaveTime} сек
      </p>
      <div
        className={`
        modal-main__result__control
        ${!isHost ? 'modal-main__result__control-center' : ''}
        `}
      >
        {isHost && (
          <Button
            className="modal-main__result__control_button"
            onClick={handlers.handleDisbandLobby}
          >
            Распустить комнату
          </Button>
        )}
        {/* Временное решение, закрыт выход из комнаты не хосту*/}
        {isHost && (
          <Button
            className="modal-main__result__control_button"
            onClick={handlers.handleReturnToLobby}
          >
            Назад в комнату
          </Button>
        )}
        {isHost && (
          <Button
            className="modal-main__result__control_button modal-main__result__control_button-second"
            onClick={handlers.handleResetGame}
          >
            Еще раз
          </Button>
        )}
      </div>
    </div>
  );
};
