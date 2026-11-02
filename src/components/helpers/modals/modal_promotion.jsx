import { useSelector, useDispatch } from 'react-redux';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { selectPromotedUser } from '../../../store/slices/lobby/lobbyUiSlice';
import { selectLobbyPlayerEntities } from '@/entities/player/model/lobbyPlayerSlice';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { closeModal } from '../../../store/modalSlice';
import { Button } from '../../../shared/ui/Button';
import { BtnIcon } from '../../../shared/ui/BtnIcon';

export const ModalPromotion = () => {
  const promotedUser = useSelector(selectPromotedUser);
  const gameMode = useSelector(state => state.modal.gameMode);
  const lobbyPlayerEntities = useSelector(selectLobbyPlayerEntities);
  const dispatch = useDispatch();
  const { send } = useWebSocket();

  const isOpen = useSelector(
    state => !!state.modal.openModals['modalPromotion'],
  );

  const modalClass =
    gameMode === 'fuflomicin' ? 'fufl-modal' : gameMode ? 'game-modal' : '';
  const usernameClass = gameMode ? 'title-blue colored-text' : 'title-blue';

  const handleClose = () => dispatch(closeModal('modalPromotion'));

  const handlePromoteUser = () => {
    if (promotedUser.id) {
      let targetUserId = promotedUser.user_id;
      if (!targetUserId) {
        const playerEntity =
          lobbyPlayerEntities[promotedUser.id] ||
          Object.values(lobbyPlayerEntities).find(
            p => Number(p?.id) === Number(promotedUser.id),
          );
        targetUserId = playerEntity?.user_id;
      }

      if (!targetUserId) {
        console.error('No user_id found for promotion!');
        handleClose();
        return;
      }

      const message = {
        command: 'change_host',
        new_host: Number(targetUserId),
      };
      console.log('[ModalPromotion] Sending change_host:', message);
      send(message);
    } else {
      console.error('No player ID provided!');
    }
    handleClose();
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="body"
      className={modalClass}
    >
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="my-modal-title title-white mx-auto">
          Передача прав хоста
        </h1>
      </div>
      <ModalSVG />
      <div className="modal-game-exit__text mb-3 d-flex flex-column align-items-center">
        <p className="mb-4 text-center">
          Вы собираетесь передать права хоста игроку?
        </p>
        <span className={usernameClass}>{promotedUser.username}</span>
        <p className="m-4">Подтверждаете ваш выбор?</p>
        <div className="modal-buttons">
          <Button
            variant="outline"
            theme={
              gameMode === 'fuflomicin' ? 'fufl' : gameMode ? 'game' : 'default'
            }
            onClick={handleClose}
          >
            Нет <BtnIcon src="/img/NO.svg" />
          </Button>
          <Button
            variant="confirm"
            theme={
              gameMode === 'fuflomicin' ? 'fufl' : gameMode ? 'game' : 'default'
            }
            onClick={handlePromoteUser}
          >
            Да <BtnIcon src="/img/YES.svg" />
          </Button>
        </div>
      </div>
    </UniversalModal>
  );
};
