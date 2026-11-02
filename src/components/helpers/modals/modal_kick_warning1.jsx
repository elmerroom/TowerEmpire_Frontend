import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useUser } from '../../../entities/user/model/hooks';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { selectDeletedUser } from '../../../store/slices/lobby/lobbyUiSlice';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { closeModal, openModal } from '../../../store/modalSlice';
import { Button } from '../../../shared/ui/Button';
import { BtnIcon } from '../../../shared/ui/BtnIcon';
import { useInteraction } from '@/features/interaction-orchestrator';

export const ModalKickLobby = () => {
  const { isHost } = useUser();
  const { send } = useWebSocket();
  const { registerLegacyModal, startInteraction } = useInteraction();
  const dispatch = useDispatch();
  const deletedUser = useSelector(selectDeletedUser);
  const isOpen = useSelector(
    state => !!state.modal.openModals['modalKickPlayers'],
  );

  const handleClose = () => dispatch(closeModal('modalKickPlayers'));

  useEffect(() => {
    return registerLegacyModal(
      'legacy-modal-kick-lobby',
      () => dispatch(openModal('modalKickPlayers')),
      () => dispatch(closeModal('modalKickPlayers')),
    );
  }, [dispatch, registerLegacyModal]);

  const handleDeletePlayer = () => {
    if (isHost() && deletedUser) {
      const interactionId = startInteraction('legacy-kick-lobby', {
        payload: { targetPlayerId: Number(deletedUser.id) },
        expectedEvents: ['user_kick'],
      });
      send({
        command: 'delete_user',
        delete_player: Number(deletedUser.id),
        interactionId,
      });
    } else {
      alert('Ошибка: ID игрока отсутствует.');
    }
    handleClose();
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="body"
    >
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="my-modal-title title-white mx-auto">Кик игрока</h1>
      </div>
      <ModalSVG />
      <div className="modal-game-exit__text mb-3 d-flex flex-column align-items-center">
        <p className="mb-4">Вы точно хотите исключить игрока</p>
        <span className="title-blue">{deletedUser?.username || ''}</span>
        <p className="m-4">Подтверждаете ваш выбор?</p>
        <div className="modal-buttons">
          <Button variant="outline" onClick={handleClose}>
            Нет <BtnIcon src="/img/NO.svg" />
          </Button>
          <Button variant="confirm" onClick={handleDeletePlayer}>
            Да <BtnIcon src="/img/YES.svg" />
          </Button>
        </div>
      </div>
    </UniversalModal>
  );
};
