import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { ModalConfirmCodeAuth } from './confirm_email';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { openModal, closeModal } from '../../../store/modalSlice';
import { RegisterForm } from '../../../features/auth/register/ui/register-form';

export const ModalAuth = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(state => !!state.modal.openModals['authmodal']);
  const [registrationEmail, setRegistrationEmail] = useState('');

  const handleClose = () => {
    dispatch(closeModal('authmodal'));
  };

  const handleSuccess = email => {
    setRegistrationEmail(email);
    handleClose();
    dispatch(openModal('confirmEmail'));
  };

  return (
    <>
      <ModalConfirmCodeAuth email={registrationEmail} />
      <UniversalModal
        isOpen={isOpen}
        onClose={handleClose}
        showCloseButton
        portalTarget="body"
        className="modal-w-400"
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className=""></div>
          <h1 className="my-modal-title title-white">регистрация</h1>
        </div>
        <ModalSVG />
        <RegisterForm onSuccess={handleSuccess} />
      </UniversalModal>
    </>
  );
};
