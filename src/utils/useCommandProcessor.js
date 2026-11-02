import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setAuth, clearUser } from '@/entities/user/model/slice';
import { resetGame } from '../store/slices/game/gameSlice';
import { useLobbyPassword } from '../components/helpers/hooks/useLobbyPassword';
import {
  setCommandModalContent,
  clearModal,
  openModal,
  closeModal,
} from '../store/modalSlice';
import { clearChats } from '../store/slices/lobby/lobbyUiSlice';
import { useWarning } from '../features/warnings/index';
import useUser from '../entities/user/model/hooks';

export const useCommandProcessor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showWarning } = useWarning();
  const { isRegisteredUser, userId, isHost } = useUser();
  const { set: setLobbyPassword } = useLobbyPassword();

  const handleCloseModal = modalId => {
    dispatch(closeModal(modalId));
    return Promise.resolve();
  };

  // Общая функция для выхода (logout), учитывающая тип пользователя и побочные эффекты
  const exitFlow = async (modalId, delay = 2000, modalContent = null) => {
    if (modalContent) {
      dispatch(setCommandModalContent(modalContent));
    }
    dispatch(openModal(modalId));
    await new Promise(resolve => {
      setTimeout(resolve, delay);
    });
    if (!isRegisteredUser()) {
      dispatch(setAuth(false));
      dispatch(clearUser());
    }
    dispatch(clearChats());
    sessionStorage.removeItem('currentGameId');
    sessionStorage.removeItem('currentGameType');
    resetGame();
    dispatch(closeModal(modalId));
    dispatch(clearModal());
    navigate('/');
  };

  // Объект с командами и соответствующими обработчиками
  const commands = {
    start_game: () => {
      navigate('evil-cards', {
        state: { fromLobby: true },
      });
    },
    exit_all_to_lobby: () => {
      navigate(`/lobby/${id}`, {
        state: { noAutoReconnect: true },
      });
    },
    exit_all_from_game: () => {
      showWarning({
        title: 'УПС...',
        text: isHost() ? 'Вы удалили игру' : 'Игра была завершена хостом',
        redirectPath: `/`,
      });
    },
    delete_user_game: () => {
      showWarning({
        title: 'Вас удалили из игры',
        text: 'Вы больше не можете участвовать в игре.',
        redirectPath: `/`,
      });
    },
    exit_from_all: () => {
      showWarning({
        title: 'УПС...',
        text: isHost() ? 'Вы удалили комнату' : 'Комната была распущена хостом',
        redirectPath: `/`,
      });
    },
    delete_user: () => {
      showWarning({
        title: 'УПС...',
        text: 'Вы были удалены из комнаты',
        redirectPath: `/`,
      });
    },
    set_pw: encodedPassword => {
      try {
        const password = atob(encodedPassword);
        const currentLobbyId = id;
        if (password.length > 128) return;
        setLobbyPassword(currentLobbyId, password);
        console.log(
          `[system] Пароль от комнаты ${currentLobbyId} получен и сохранён.`,
        );
      } catch (err) {
        console.error('Ошибка декодирования пароля:', err);
      }
    },
  };

  // Функция для извлечения id из строки команды по указанному префиксу
  const extractCommandId = (commandMessage, prefix) => {
    const idStr = commandMessage.substring(prefix.length);
    const targetId = Number(idStr);
    if (isNaN(targetId)) {
      console.error('Некорректный id в команде:', commandMessage);
      return null;
    }
    return targetId;
  };

  // Функция для обработки входящей команды
  const processCommand = commandMessage => {
    if (typeof commandMessage !== 'string') {
      console.error('ошибка: Команда должна быть строкой.');
      return;
    }
    // Обработка команды для удаления пользователя из лобби по id:
    const prefixDeleteUser = '/cmd_delete_user_id=';
    if (commandMessage.startsWith(prefixDeleteUser)) {
      const targetId = extractCommandId(commandMessage, prefixDeleteUser);
      if (targetId !== null && userId === targetId) {
        commands.delete_user();
      } else {
        console.log(
          `Команда delete_user проигнорирована для пользователя ${userId}, target id: ${targetId}`,
        );
      }
      return;
    }
    // Обработка команды для удаления пользователя из игры по id:
    const prefixDeleteUserGame = '/cmd_delete_user_game_id=';
    if (commandMessage.startsWith(prefixDeleteUserGame)) {
      const targetId = extractCommandId(commandMessage, prefixDeleteUserGame);
      if (targetId !== null && userId === targetId) {
        commands.delete_user_game();
      } else {
        console.log(
          `Команда delete_user_game проигнорирована для пользователя ${userId}, target id: ${targetId}`,
        );
      }
      return;
    }
    // Обработка команды установки пароля: /cmd_set_pw=encodedPassword
    const prefixSetPassword = '/cmd_set_pw=';
    if (commandMessage.startsWith(prefixSetPassword)) {
      const encodedPassword = commandMessage
        .substring(prefixSetPassword.length)
        .trim();
      if (encodedPassword && commands.set_pw) {
        commands.set_pw(encodedPassword);
      }
      return;
    }
    // Обработка остальных команд (удаляем префикс "/cmd_")
    const commandKey = commandMessage.substring(5);
    if (Object.prototype.hasOwnProperty.call(commands, commandKey)) {
      commands[commandKey]();
    } else {
      console.warn('Неизвестная команда:', commandKey);
    }
  };

  return {
    processCommand,
    handleCloseModal,
    exitFlow,
  };
};

export default useCommandProcessor;
