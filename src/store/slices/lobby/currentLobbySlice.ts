import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LobbyMeta } from '@/shared/types/domain';
import type { RootState } from '@/store/store';
import { selectAllLobbyPlayers } from '@/entities/player/model/lobbyPlayerSlice';
import { getUserId as selectUserIdFromSlice } from '@/entities/user/model/slice';

type CurrentLobbyState = {
  lobby: LobbyMeta | null;
  optimisticHostUserId: number | null;
};

const initialState: CurrentLobbyState = {
  lobby: null,
  optimisticHostUserId: null,
};

const currentLobbySlice = createSlice({
  name: 'currentLobby',
  initialState,
  reducers: {
    setCurrentLobby(state, action: PayloadAction<LobbyMeta>) {
      const { players: _players, ...meta } = action.payload as LobbyMeta & {
        players?: unknown;
      };
      state.lobby = meta;
      state.optimisticHostUserId = null;
    },
    patchCurrentLobby(state, action: PayloadAction<Partial<LobbyMeta>>) {
      const { players: _players, ...meta } =
        action.payload as Partial<LobbyMeta> & { players?: unknown };
      if (state.lobby) {
        state.lobby = { ...state.lobby, ...meta };
      } else {
        state.lobby = meta as LobbyMeta;
      }
    },
    resetCurrentLobby(state) {
      state.lobby = null;
      state.optimisticHostUserId = null;
    },
    setMaxPlayers(state, action: PayloadAction<number>) {
      if (!state.lobby) return;
      state.lobby.max_players = action.payload;
    },
    setIsPrivate(state, action: PayloadAction<boolean>) {
      if (!state.lobby) return;
      state.lobby.is_private = action.payload;
    },
    setOptimisticHostUserId(state, action: PayloadAction<number | null>) {
      state.optimisticHostUserId =
        action.payload == null ? null : Number(action.payload);
    },
    resetOptimisticHost(state) {
      state.optimisticHostUserId = null;
    },
  },
});

export const {
  setCurrentLobby,
  patchCurrentLobby,
  resetCurrentLobby,
  setMaxPlayers,
  setIsPrivate,
  setOptimisticHostUserId,
  resetOptimisticHost,
} = currentLobbySlice.actions;

export default currentLobbySlice.reducer;

export const selectCurrentLobby = (state: RootState) =>
  state.currentLobby.lobby;

export const selectCurrentLobbyId = (state: RootState) =>
  selectCurrentLobby(state)?.id ?? null;

export const selectHostUserId = (state: RootState) => {
  const optimistic = state.currentLobby.optimisticHostUserId;
  if (optimistic != null) return optimistic;

  const players = selectAllLobbyPlayers(state as any);
  const host = players.find(player => player?.is_host);
  const rawUserId = host?.user_id;

  if (rawUserId == null) return null;
  const parsed = Number(rawUserId);
  return Number.isFinite(parsed) ? parsed : null;
};

export const selectIsHostFromCurrent = (state: RootState) => {
  const hostUserId = selectHostUserId(state);
  const myUserId = selectUserIdFromSlice(state);

  if (hostUserId == null || myUserId == null) {
    return false;
  }

  return Number(hostUserId) === Number(myUserId);
};
