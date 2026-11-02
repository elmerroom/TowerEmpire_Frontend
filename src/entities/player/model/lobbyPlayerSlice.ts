import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { LobbyPlayer } from './types';

const lobbyPlayersAdapter = createEntityAdapter<LobbyPlayer, number>({
  selectId: p => p.id,
});

const slice = createSlice({
  name: 'lobbyPlayers',
  initialState: lobbyPlayersAdapter.getInitialState(),
  reducers: {
    setAll: lobbyPlayersAdapter.setAll,
    upsertMany: lobbyPlayersAdapter.upsertMany,
    upsertOne: lobbyPlayersAdapter.upsertOne,
    removeOne: lobbyPlayersAdapter.removeOne,
    reset: () => lobbyPlayersAdapter.getInitialState(),
    setHostByUserId: (state, action: { payload: number }) => {
      const newHostUserId = action.payload;
      for (const id of state.ids) {
        const player = state.entities[id];
        if (player) {
          player.is_host = Number(player.user_id) === Number(newHostUserId);
        }
      }
    },
    setHostByPlayerId: (state, action: { payload: number }) => {
      const newHostPlayerId = action.payload;
      for (const id of state.ids) {
        const player = state.entities[id];
        if (player) {
          player.is_host = Number(player.id) === Number(newHostPlayerId);
        }
      }
    },
  },
});

export const {
  setAll,
  upsertMany,
  upsertOne,
  removeOne,
  reset,
  setHostByUserId,
  setHostByPlayerId,
} = slice.actions;

export default slice.reducer;

export const selectLobbyPlayersState = (state: RootState) => state.lobbyPlayers;

export const {
  selectAll: selectAllLobbyPlayers,
  selectById: selectLobbyPlayerById,
  selectEntities: selectLobbyPlayerEntities,
  selectIds: selectLobbyPlayerIds,
} = lobbyPlayersAdapter.getSelectors<RootState>(selectLobbyPlayersState);

export const selectLobbyPlayerIdByUserId = (
  state: RootState,
  userId: number | null | undefined,
) => {
  if (userId == null) return null;
  const entities = selectLobbyPlayerEntities(state);
  for (const player of Object.values(entities)) {
    if (!player) continue;
    if (Number(player.user_id) === Number(userId)) return player.id;
  }
  return null;
};
