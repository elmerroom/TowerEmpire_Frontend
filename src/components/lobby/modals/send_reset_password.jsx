import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { ModalSetNewPassword } from './set_new_password';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { openModal, closeModal } from '../../../store/modalSlice';
import { SendResetPasswordForm } from '../../../features/auth/password-reset/ui/send-reset-password-form';

export const ModalSendEmailResetPassword = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(
    state => !!state.modal.openModals['resetPassword'],
  );

  const [email, setEmail] = useState('');

  const handleClose = () => {
    dispatch(closeModal('resetPassword'));
  };

  const handleSuccess = submittedEmail => {
    setEmail(submittedEmail);
    handleClose();
    setTimeout(() => {
      dispatch(openModal('set-new-password'));
    }, 100);
  };

  return (
    <>
      <ModalSetNewPassword email={email} />
      <UniversalModal
        isOpen={isOpen}
        onClose={handleClose}
        showCloseButton
        portalTarget="body"
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className=""></div>
          <h1 className="my-modal-title title-white">Восстановление пароля</h1>
        </div>
        <div className="modal_svg">
          <ModalSVG />
        </div>
        <SendResetPasswordForm onSuccess={handleSuccess} />
      </UniversalModal>
    </>
  );
};
