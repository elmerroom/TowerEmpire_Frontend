import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import useUser from '../../../../entities/user/model/hooks';
import { Modal } from '../../../../shared/modal/modal';
import { useWebSocket } from '../../../../store/contexts/WsRootProvider';
import { ModalWithResultUI } from './ui/modal_with_result_ui';
import {
  selectFinalPlayers,
  selectEndTimestamp,
  selectGameStartTs,
} from '../../../../entities/game/model/gameBjSlice';
import {
  getEndGamePlayers,
  getEndGameTime,
  getGameStartTime,
} from '../../../../store/fuflomicin/fuflSlice';

const GAME_CONFIG = {
  blackjokes: {
    finishPhase: 'finish_game',
    gameName: 'Black Jokes',
    useSelectors: () => ({
      startGameTime: useSelector(selectGameStartTs),
      endGameTime: useSelector(selectEndTimestamp),
      endGamePlayers: useSelector(selectFinalPlayers),
    }),
  },
  fuflomicin: {
    finishPhase: 'FINISH_GAME',
    gameName: 'Fuflomycin',
    useSelectors: () => ({
      startGameTime: useSelector(getGameStartTime),
      endGameTime: useSelector(getEndGameTime),
      endGamePlayers: useSelector(getEndGamePlayers),
    }),
  },
};

export const ModalWithResult = ({ gamePhase, gameType = 'blackjokes' }) => {
  const config = GAME_CONFIG[gameType];
  const { startGameTime, endGameTime, endGamePlayers } = config.useSelectors();
  const { send } = useWebSocket();
  const { isHost } = useUser();
  const navigate = useNavigate();
  const { id } = useParams();
  const sortedPlayers = [...endGamePlayers].sort((a, b) => b.points - a.points);
  const [leaveTime, setLeaveTime] = useState(20);

  const message = { command: 'exit_all_from_game' };

  const handleReturnToLobby = () => {
    if (isHost()) {
      send(message);
      navigate(`/lobby/${id}`);
    } else {
      navigate(`/lobby/${id}`, {
        state: { noAutoReconnect: true },
      });
    }
  };
  const handleResetGame = () => {
    if (isHost()) {
      const message = {
        command: 'start_game',
        game: config.gameName,
      };
      send(message);
    }
  };
  const handleDisbandLobby = () => {
    if (isHost()) {
      send({ command: 'exit_from_all' });
    }
  };

  const handlers = {
    handleReturnToLobby: handleReturnToLobby,
    handleResetGame: handleResetGame,
    handleDisbandLobby: handleDisbandLobby,
  };

  const options = {
    startGameTime: startGameTime,
    endGameTime: endGameTime,
  };

  useEffect(() => {
    if (gamePhase === config.finishPhase) {
      setLeaveTime(20);
      const timer = setInterval(() => {
        setLeaveTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleReturnToLobby();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase]);

  return (
    <Modal
      gamePhase={config.finishPhase}
      currentGamePhase={gamePhase}
      closeButton={false}
      className="modal-no-padding"
    >
      <ModalWithResultUI
        leaveTime={leaveTime}
        options={options}
        handlers={handlers}
        players={sortedPlayers}
        isHost={isHost()}
        variant={gameType !== 'blackjokes' ? gameType : undefined}
      />
    </Modal>
  );
};
