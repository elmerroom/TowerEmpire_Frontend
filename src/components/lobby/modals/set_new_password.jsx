import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { closeModal } from '../../../store/modalSlice';
import { SetNewPasswordForm } from '../../../features/auth/password-reset/ui/set-new-password-form';

export const ModalSetNewPassword = ({ email }) => {
  const dispatch = useDispatch();
  const isOpen = useSelector(
    state => !!state.modal.openModals['set-new-password'],
  );

  const [error, setError] = useState('');
  const [isSuccess, setSuccess] = useState('');

  const handleClose = () => {
    dispatch(closeModal('set-new-password'));
  };

  const showTemporaryMessage = setter => {
    return message => {
      setter(message);
      setTimeout(() => setter(''), 3000);
    };
  };

  const showError = useMemo(() => showTemporaryMessage(setError), []);
  const showSuccess = useMemo(() => showTemporaryMessage(setSuccess), []);

  const handleSuccess = message => {
    showSuccess(message);
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
        <h1 className="my-modal-title title-white">смена пароля</h1>
      </div>
      <div className="modal_svg">
        <ModalSVG />
      </div>
      <SetNewPasswordForm email={email} onSuccess={handleSuccess} />
      <div className={`error success ${isSuccess ? 'visible' : 'hidden'}`}>
        {isSuccess}
      </div>
      <div className={`error ${error ? 'visible' : 'hidden'}`}>{error}</div>
    </UniversalModal>
  );
};
