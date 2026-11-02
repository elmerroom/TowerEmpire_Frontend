import { ModalSVG } from '../../../shared/svg/modal_svg';
import { useDispatch, useSelector } from 'react-redux';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { openModal, closeModal } from '../../../store/modalSlice';
import { GuestLoginForm } from '../../../features/auth/guest-login/ui/guest-login-form';

export const ModalPlayNoauth = () => {
  const dispatch = useDispatch();
  const modalData = useSelector(
    state => state.modal.openModals['play-no_auth'],
  );
  const isOpen = !!modalData;
  const roomId =
    modalData && typeof modalData === 'object' ? modalData.roomId : '';

  const handleClose = () => {
    dispatch(closeModal('play-no_auth'));
  };

  const handleSuccess = () => {
    handleClose();
    const element = document.querySelector(`[data-room-id="${roomId}"]`);
    if (element) {
      element.click();
    } else {
      console.error(`Element with data-room-id="${roomId}" not found.`);
    }
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="body"
    >
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="my-modal-title title-white">Вход в комнату</h1>
      </div>
      <ModalSVG />

      <GuestLoginForm onSuccess={handleSuccess} />

      <div className="modal_link">
        <span
          onClick={() => {
            handleClose();
            dispatch(openModal('loginmodal'));
          }}
        >
          Войти
        </span>
        /
        <span
          onClick={() => {
            handleClose();
            dispatch(openModal('authmodal'));
          }}
        >
          Зарегистрироваться
        </span>
      </div>
    </UniversalModal>
  );
};
