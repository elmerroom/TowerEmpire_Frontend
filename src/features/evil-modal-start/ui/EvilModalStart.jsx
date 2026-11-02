import { useState, useEffect } from 'react';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { useUser } from '../../../entities/user/model/hooks';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import styles from './EvilModalStart.module.css';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { Button } from '../../../shared/ui/Button';

export const EvilModalStart = () => {
  const { isHost } = useUser();
  const { send } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('currentGameId')) {
      setIsOpen(true);
    }
  }, []);

  const handleStartGame = () => {
    if (isHost()) {
      const message = { command: 'start_game', game: 'Black Jokes' };
      console.log('game start');
      send(message);
    } else {
      alert('У вас нет прав хоста');
    }
    setIsOpen(false);
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      closeable={false}
      showCloseButton={false}
      portalTarget="body"
      className="game-modal"
    >
      <h1 className="my-modal-title title-white mx-auto">100 черных острот</h1>
      <ModalSVG></ModalSVG>
      {isHost() && (
        <Button
          variant="confirm"
          theme="game"
          className={styles.startButton}
          onClick={handleStartGame}
        >
          Начать игру
        </Button>
      )}
    </UniversalModal>
  );
};
