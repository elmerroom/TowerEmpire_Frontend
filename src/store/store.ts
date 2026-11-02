// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { env } from '@/shared/config/env';

// feature reducers (JS ок для импорта в TS)
import animateReducer from '../features/animation/model/animateSlice';
import { deleteAccountApi } from '../features/delete-account';
import { audioSettingsMiddleware } from '../features/gameMusic/middleware/audioSettingsMiddleware';
import audioSettingsReducer from '../features/gameMusic/model/audioSettingsSlice';
import { gameSettingsReducer } from '../features/gameSettings';
import { warningsReducer } from '../features/warnings';

// Smart update middleware для WS
import { smartUpdateMiddleware } from '../websocket/middleware/smartUpdateMiddleware';

// slice reducers

import gameReducer from './slices/game/gameSlice';
import lobbyUiReducer from './slices/lobby/lobbyUiSlice';
import currentLobbyReducer from '@/store/slices/lobby/currentLobbySlice';
import currentPlayerReducer from '@/entities/player/model/currentPlayerSlice';
import lobbyPlayersReducer from '@/entities/player/model/lobbyPlayerSlice';
import gamePlayersReducer from '@/entities/player/model/gamePlayerSlice';
import playersReducer from '@/store/slices/players/playersSlice';
import { gameBjSReducer } from '@/entities/game';
import modalSlice from './modalSlice';
import userReducer from '@/entities/user/model/slice';
import authErrorReducer from '@/store/slices/authErrorSlice';
import fuflReducer from './fuflomicin/fuflSlice';

// RTK Query API slices
import { authApi } from './api/authApi';
import { userApi } from '../entities/user/api/user-api';
import { lobbyApi } from './api/lobbyApi';
import { gamePlayersApi } from '../features/playerReconnection';

export const store = configureStore({
  reducer: {
    // обычные слайсы
    user: userReducer,
    lobbyUi: lobbyUiReducer,
    currentLobby: currentLobbyReducer,
    currentPlayer: currentPlayerReducer,
    lobbyPlayers: lobbyPlayersReducer,
    gamePlayers: gamePlayersReducer,
    players: playersReducer,
    modal: modalSlice,
    gameBj: gameBjSReducer,
    game: gameReducer,
    fuflGame: fuflReducer,
    warnings: warningsReducer,
    gameSettings: gameSettingsReducer,
    audioSettings: audioSettingsReducer,
    animate: animateReducer,
    authError: authErrorReducer,

    // api-редьюсеры
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [lobbyApi.reducerPath]: lobbyApi.reducer,
    [gamePlayersApi.reducerPath]: gamePlayersApi.reducer,
    [deleteAccountApi.reducerPath]: deleteAccountApi.reducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
      smartUpdateMiddleware, // Smart WS update middleware (before API)
      authApi.middleware,
      userApi.middleware,
      lobbyApi.middleware,
      gamePlayersApi.middleware,
      deleteAccountApi.middleware,
      audioSettingsMiddleware,
    ),

  devTools: !env.PROD,
});
// полезно для refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Типы стора
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
