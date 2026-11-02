import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../entities/user/model/hooks';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { leaveRoomFlow } from '../../../utils/logoutFlow';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { closeModal } from '../../../store/modalSlice';
import { Button } from '../../../shared/ui/Button';
import { getGameModeClass } from '@/utils/gameModeClass';

export const ModalExit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { send } = useWebSocket();
  const { isHost } = useUser();
  const isOpen = useSelector(
    state => !!state.modal.openModals['modalGameExit'],
  );
  const gameMode = useSelector(state => state.modal.gameMode);
  const modalClass = getGameModeClass(gameMode, 'modal');

  const handleClose = () => dispatch(closeModal('modalGameExit'));

  const dissolveRoom = () => {
    handleClose();
    if (isHost()) {
      send({ command: 'exit_from_all' });
    }
  };

  const handleExit = async () => {
    handleClose();
    try {
      await send({ command: 'delete_user_from' });
    } catch (error) {
      console.warn('[exit] WS not open, skip WS message', error);
    } finally {
      leaveRoomFlow({ dispatch, navigate });
    }
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="#game-modal-root"
      className={`${modalClass} modal-w-480`}
    >
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="my-modal-title title-white mx-auto">Выход из комнаты</h1>
      </div>
      <ModalSVG />
      <div className="modal-game-exit__text mb-3 d-flex flex-column align-items-center">
        <p className="mb-3" style={{ textAlign: 'center' }}>
          {isHost()
            ? 'При выходе права хоста будут переданы другому игроку либо вы можете распустить комнату'
            : 'Уверены, что хотите покинуть комнату?'}
        </p>
        {isHost() && <span className="title-blue">Вы точно хотите выйти?</span>}
        <img
          className="mb-4"
          src="/img/cat-leave.gif"
          width="150"
          alt="crying cat"
        />
        <div className="d-flex">
          <Button
            variant="outline"
            theme={gameMode === 'fuflomicin' ? 'fufl' : 'default'}
            className="me-3"
            onClick={dissolveRoom}
          >
            {isHost() ? 'Распустить комнату' : 'Назад'}
          </Button>
          <Button onClick={handleExit}>Выйти</Button>
        </div>
      </div>
    </UniversalModal>
  );
};
