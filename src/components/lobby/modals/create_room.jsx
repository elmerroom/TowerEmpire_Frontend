import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { ToggleSwitch } from '../../../shared/toggle-switch/ToggleSwitch';
import {
  generateRandomUsername,
  validateUsername,
  isLatinAndDigits,
} from '../../helpers/help_functions';
import { useCreateLobbyMutation } from '../../../store/api/lobbyApi';
import { useAuthFlow } from '../../../features/auth/model/use-auth-flow';
import { setCurrentLobby } from '../../../store/slices/lobby/currentLobbySlice';
import { setAll as setAllPlayers } from '@/store/slices/players/playersSlice';
import { useLobbyPassword } from '../../helpers/hooks/useLobbyPassword';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { openModal, closeModal } from '../../../store/modalSlice';
import { AuthErrorHandler } from '../../../features/auth/model/errors/auth-error-handler';
import { Button } from '../../../shared/ui/Button';

export const ModalCreateRoom = () => {
  const navigate = useNavigate();
  const isAuth = useSelector(state => state.user.isAuth);
  const dispatch = useDispatch();
  const { set: setLobbyPassword } = useLobbyPassword();

  const isOpen = useSelector(state => !!state.modal.openModals['createRoom']);

  const handleClose = () => {
    dispatch(closeModal('createRoom'));
    setError('');
  };

  const validateUser = value => {
    if (isAuth) {
      return validateUsername(value);
    } else {
      return true;
    }
  };
  const [isPrivate, setPrivate] = useState(false);

  const validatePassword = value => {
    if (!isPrivate) return true;
    return value.length >= 3 && value.length <= 10 && isLatinAndDigits(value);
  };

  const [roomName, setRoomName] = useState('');
  const [username, setUsername] = useState(generateRandomUsername());
  const [password, setPassword] = useState('');
  const [isDisabled, setDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isValid, setValid] = useState({
    roomName: '',
    username: '',
    password: '',
  });
  const [createLobby] = useCreateLobbyMutation();
  const { signIn } = useAuthFlow();

  useEffect(() => {
    if (
      validateRoomName(roomName) &&
      validateUser(username) &&
      validatePassword(password)
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, username, isPrivate, password]);

  const handleSubmitAuth = async () => {
    try {
      if (!isAuth) {
        const resp = await signIn({ username });
        if (!resp) return;
      }
      const responseCreate = await createLobby({
        title: roomName,
        max_players: 10,
        is_private: isPrivate,
        password: isPrivate ? password : null,
      }).unwrap();

      console.log('Запрос на создание лобби', responseCreate);
      dispatch(
        setAllPlayers(
          Array.isArray(responseCreate?.players) ? responseCreate.players : [],
        ),
      );
      dispatch(setCurrentLobby(responseCreate));
      const lobbyId = responseCreate?.id;
      setLobbyPassword(lobbyId, password);

      setPassword('');
      setUsername('');
      setRoomName('');
      setDisabled(false);
      setError('');
      navigate(`/lobby/${lobbyId}`);
      handleClose();
    } catch (error) {
      const authError = AuthErrorHandler.buildAuthError(error);
      setError(authError.message);
    }
  };

  const handleRoomName = value => {
    setRoomName(value);
    setError('');
    if (!validateRoomName(value)) {
      setValid(prev => ({
        ...prev,
        roomName: 'Неверный формат названия комнаты',
      }));
    } else {
      setValid(prev => ({ ...prev, roomName: '' }));
    }
  };
  const handlePassword = value => {
    setPassword(value);
    if (!validatePassword(value)) {
      setValid(prev => ({ ...prev, password: 'Неверный формат пароля' }));
    } else {
      setValid(prev => ({ ...prev, password: '' }));
    }
  };
  const handleUserName = value => {
    setUsername(value);
    if (!validateUser(value)) {
      setValid(prev => ({
        ...prev,
        username: 'Неверный формат имени пользователя',
      }));
    } else {
      setValid(prev => ({ ...prev, username: '' }));
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isDisabled) handleSubmitAuth();
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
        <h1 className="my-modal-title title-white">новая комната</h1>
      </div>
      <ModalSVG />

      <div className="form_input" onKeyDown={handleKeyDown}>
        <form>
          <div className="mb-3 d-flex justify-content-between align-items-center w-100">
            <label htmlFor="toggleSwitch" className="text-color-blue">
              Закрытая комната:
            </label>
            <ToggleSwitch
              checked={isPrivate}
              onChange={setPrivate}
              id="toggle-create"
              inactiveColor="#777"
              activeLabel="Вкл"
              inactiveLabel="Выкл"
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="inputRoomName"
              className="form-label text-color-blue"
            >
              Название комнаты (3-15 символов):
            </label>
            <input
              type="text"
              maxLength="15"
              className={`form-control ${isValid.roomName && 'form-control_error'}`}
              id="inputRoomName"
              aria-describedby="roomName"
              value={roomName}
              onChange={e => handleRoomName(e.target.value)}
            />
            <div className="error-input">
              {isValid.roomName && isValid.roomName}
            </div>
          </div>
          <div className={`mb-3 public_input ${isPrivate && 'visible'}`}>
            <label
              htmlFor="inputpassword"
              className="form-label text-color-blue"
            >
              Пароль к комнате (3-10 символов):
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                maxLength="10"
                className={`form-control ${isValid.password && 'form-control_error'}`}
                id="
                 inputpassword"
                value={password}
                onChange={e => handlePassword(e.target.value)}
              />
              <div
                className="reg_helper reg_helper--up"
                style={{ position: 'absolute', top: 6, right: -30, zIndex: 10 }}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                <div className="reg_helper-modal">
                  <ul>
                    <li>Только латинские буквы и арабские цифры;</li>
                    <li>Без пробелов.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="error-input">
              {isValid.password && isValid.password}
            </div>{' '}
          </div>
          {!isAuth && (
            <div className="mb-3 reg">
              <label
                htmlFor="inputNickname1"
                className="form-label text-color-blue"
              >
                Никнейм:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  maxLength="15"
                  className={`form-control ${isValid.username && 'form-control_error'}`}
                  id="inputNickname1"
                  aria-describedby="inputNickname"
                  value={username}
                  onChange={e => handleUserName(e.target.value)}
                />
                <div
                  className="reg_helper"
                  style={{ position: 'absolute', top: 6, right: -30 }}
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                  <div className="reg_helper-modal">
                    <ul>
                      <li>Кириллица или латиница.</li>
                      <li>
                        Допустимы символы, цифры и пробелы, но не может состоять
                        только из пробелов.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="error-input">
                {isValid.username && isValid.username}
              </div>
            </div>
          )}
        </form>
      </div>
      <div className={`error ${error ? 'visible' : 'hidden'}`}>{error}</div>
      <div className="d-flex justify-content-center flex-column">
        {!isAuth && (
          <div className="modal_link">
            <span
              onClick={() => {
                handleClose();
                dispatch(openModal('loginmodal'));
              }}
            >
              Войти
            </span>{' '}
            /{' '}
            <span
              onClick={() => {
                handleClose();
                dispatch(openModal('authmodal'));
              }}
            >
              Зарегистрироваться
            </span>
          </div>
        )}
        <Button
          id="create-room-button"
          variant="submit"
          type="submit"
          className="d-flex justify-content-center"
          disabled={isDisabled}
          onClick={handleSubmitAuth}
        >
          Подтвердить
        </Button>
      </div>
    </UniversalModal>
  );
};

const validateRoomName = value => {
  const regex =
    /^(?!.*(?:https?:\/\/|www\.))(?!\s*$)[\p{L}\p{N}\p{P}\p{S}\p{Z}]{3,15}$/u;

  return regex.test(value);
};
