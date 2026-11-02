import { resetLobbyUi, setIsKicked } from '../store/slices/lobby/lobbyUiSlice';
import { clearModal } from '../store/modalSlice';
import { clearUser, setAuth } from '@/entities/user/model/slice';
import { resetGame } from '../store/slices/game/gameSlice';
import { resetSettings } from '../features/gameSettings/index';
import { resetCurrentLobby } from '../store/slices/lobby/currentLobbySlice';
import { reset as resetLobbyPlayers } from '@/entities/player/model/lobbyPlayerSlice';
import { resetCurrentPlayer } from '@/entities/player/model/currentPlayerSlice';

/**
 * Универсальный logout
 * @param {object} options
 * @param {boolean} options.isRegisteredUser - статус регистрации
 * @param {Function} options.dispatch - Redux dispatch
 * @param {Function} options.navigate - функция навигации
 */
export const leaveRoomFlow = ({ dispatch, navigate }) => {
  dispatch(setIsKicked(false));
  dispatch(resetLobbyUi());
  dispatch(resetLobbyPlayers());
  dispatch(resetCurrentLobby());
  dispatch(resetCurrentPlayer());
  dispatch(resetGame());
  dispatch(resetSettings());
  dispatch(clearModal());

  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('lobby-password-')) {
      sessionStorage.removeItem(key);
    }
  });
  sessionStorage.removeItem('currentGameId');
  sessionStorage.removeItem('currentGameType');

  navigate('/lobby', { replace: true });
};

export const logoutFlow = async ({ isRegisteredUser, dispatch, navigate }) => {
  if (!isRegisteredUser) {
    sessionStorage.removeItem('refreshToken');
    dispatch(setAuth(false));
    dispatch(clearUser());
  }
  leaveRoomFlow({ dispatch, navigate });
};
