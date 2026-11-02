import { useSelector, useDispatch } from 'react-redux';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { openModal, closeModal } from '../../../store/modalSlice';
import { LoginForm } from '../../../features/auth/login/ui/login-form';

export const ModalLogin = () => {
  const dispatch = useDispatch();

  const isOpen = useSelector(state => !!state.modal.openModals['loginmodal']);

  const handleClose = () => {
    dispatch(closeModal('loginmodal'));
  };

  const handleSuccess = () => {
    handleClose();
  };

  const handleForget = () => {
    handleClose();
    dispatch(openModal('resetPassword'));
  };

  const handleNotConfirmed = email => {
    handleClose();
    dispatch(
      openModal({
        id: 'confirmEmail',
        data: { email, autoShowResendForm: true },
      }),
    );
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="body"
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className=""></div>
        <h1 className="my-modal-title title-white">Авторизация</h1>
      </div>
      <ModalSVG />
      <LoginForm
        onSuccess={handleSuccess}
        onForgetPassword={handleForget}
        onNotConfirmed={handleNotConfirmed}
      />
    </UniversalModal>
  );
};
