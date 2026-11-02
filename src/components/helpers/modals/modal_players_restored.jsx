import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '../../../entities/user/model/hooks';
import { closeModal, openModal } from '../../../store/modalSlice';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { Button } from '../../../shared/ui/Button';
import { getGameModeClass } from '@/utils/gameModeClass';
import { selectIsKicked } from '@/store/slices';

export const ModalPlayersRestored = () => {
  const dispatch = useDispatch();
  const { isHost } = useUser();
  const { send } = useWebSocket();

  const isKicked = useSelector(selectIsKicked);
  const isOpen =
    useSelector(state => !!state.modal.openModals['modalPlayersRestored']) &&
    !isKicked;
  const gameMode = useSelector(state => state.modal.gameMode);
  const modalClass = getGameModeClass(gameMode, 'modal');

  useEffect(() => {
    return () => dispatch(closeModal('modalPlayersRestored'));
  }, [dispatch]);

  const handleBackToGame = async () => {
    handleClose();
  };
  const handleClose = () => dispatch(closeModal('modalPlayersRestored'));

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={() => {}}
      showCloseButton={false}
      closeable={false}
      portalTarget="#game-modal-root"
      className={`modal-w-480 ${modalClass}`}
    >
      <h1 className="my-modal-title title-white mx-auto">Игроки вернулись</h1>
      <ModalSVG />
      {!isHost() && (
        <div className="error-message">
          Игроков достаточно для продолжения игры. <br /> Подождите, пока хост
          запустит новый раунд.
        </div>
      )}
      {isHost() && (
        <>
          <div className="error-message">
            Вы - хост.
            <br /> Игроков достаточно для продолжения.
            <br />
            Нажмите «Продолжить игру», чтобы запустить раунд.
          </div>
          <div className="modal-buttons">
            <Button
              variant="confirm"
              theme={
                gameMode === 'fuflomicin'
                  ? 'fufl'
                  : gameMode === 'hff'
                    ? 'hff'
                    : 'game'
              }
              onClick={handleBackToGame}
            >
              Продолжить игру
            </Button>
          </div>
        </>
      )}
    </UniversalModal>
  );
};
