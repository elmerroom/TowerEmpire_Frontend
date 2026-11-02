import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { useLobbyPassword } from '../../helpers/hooks/useLobbyPassword';
import { isLatinAndDigits } from '../../helpers/help_functions';
import { useAddUser } from '../../helpers/hooks/useAddUser';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { closeModal } from '../../../store/modalSlice';
import { Button } from '../../../shared/ui/Button';

export const ModalEnterLobbyPassword = () => {
  const dispatch = useDispatch();
  const modalData = useSelector(
    state => state.modal.openModals['play-enter_password'],
  );
  const isOpen = !!modalData;
  const roomId =
    modalData && typeof modalData === 'object' ? modalData.roomId : '';

  const { set: setLobbyPassword } = useLobbyPassword();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDisabled, setDisabled] = useState(false);
  const AddUser = useAddUser();

  const handleClose = () => {
    dispatch(closeModal('play-enter_password'));
    setPassword('');
    setError('');
  };

  useEffect(() => {
    if (
      password.length < 3 ||
      password.length > 10 ||
      !isLatinAndDigits(password)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [password]);

  const handlePasswordChange = e => {
    const newPassword = e.target.value.replace(/\s/g, '').slice(0, 10);
    setPassword(newPassword);
  };

  const handleSubmit = async () => {
    setLobbyPassword(roomId, password);
    try {
      await AddUser({
        id: roomId,
        password: password,
      });
      setPassword('');
      handleClose();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isDisabled) handleSubmit();
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
      <ModalSVG></ModalSVG>
      <div className="form_input" onKeyDown={handleKeyDown}>
        <form>
          <div className="mb-3">
            <label
              htmlFor="room-password"
              className="form-label text-color-blue mt-3"
            >
              Пароль комнаты:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                maxLength="10"
                id="room-password"
                className="form-control input-nickname"
                aria-describedby="room-password"
                value={password}
                onChange={handlePasswordChange}
              />
              <div
                className="reg_helper"
                style={{ position: 'absolute', top: 6, right: -30 }}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                <div className="reg_helper-modal">
                  <ul>
                    <li>Не менее 3 и не более 10 символов;</li>
                    <li>Только латинские буквы и арабские цифры;</li>
                    <li>Без пробелов.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className={`error ${error ? 'visible' : 'hidden'}`}>{error}</div>
      <div className="d-flex justify-content-center">
        <Button
          id="play-enter-password-button"
          variant="submit"
          type="submit"
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          Подтвердить
        </Button>
      </div>
    </UniversalModal>
  );
};
