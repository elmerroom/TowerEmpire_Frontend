import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { closeModal } from '../../../store/modalSlice';
import { Button } from '../../../shared/ui/Button';
import { selectCurrentLobbyId } from '@/store/slices/lobby/currentLobbySlice';

export const ModalInvitation = () => {
  const lobbyId = useSelector(selectCurrentLobbyId);
  const dispatch = useDispatch();
  const isOpen = useSelector(
    state => !!state.modal.openModals['modalInvitePlayers'],
  );

  const baseUrl = window.location.origin;
  const inviteUrl = `${baseUrl}/invite/${lobbyId}`;

  const [inviteLink, setInviteLink] = useState(inviteUrl);
  const [isCopied, setCopied] = useState(false);

  const handleClose = () => dispatch(closeModal('modalInvitePlayers'));

  useEffect(() => {
    if (lobbyId) {
      setInviteLink(`${baseUrl}/invite/${lobbyId}`);
    }
  }, [lobbyId, baseUrl]);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setCopied(false), 2000);
    }
  }, [isCopied]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="body"
    >
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="my-modal-title title-white mx-auto">
          приглашение друзей
        </h1>
      </div>
      <ModalSVG />
      <div className="modal-invite-players__text">
        <p className="mb-5 mt-2 text-center">
          Отправьте другу ссылку-приглашение в комнату
        </p>
        <div className="position-relative mb-4">
          <input
            className="mx-auto modal-invite-players__input"
            type="text"
            value={inviteLink}
            readOnly
          />
          <Button
            id="btnInvitePlayers"
            className="modal-invite-players__copy"
            onClick={copyToClipboard}
          >
            Копировать
          </Button>
        </div>
        <div
          className={`invite_success text-color-blue ${isCopied ? 'visible' : 'hidden'}`}
        >
          Ссылка успешно скопирована!
        </div>
      </div>
    </UniversalModal>
  );
};
