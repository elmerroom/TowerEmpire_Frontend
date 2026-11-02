import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { Player } from '../../../shared/types/domain';
import type { RootState } from '../../store';
import { PlayerWire } from '@/entities/game/model';

export type { Player };

const playersAdapter = createEntityAdapter<Player, number>({
  selectId: (player: Player | PlayerWire) => player.id,
});

const playersSlice = createSlice({
  name: 'players',
  initialState: playersAdapter.getInitialState(),
  reducers: {
    setAll: playersAdapter.setAll,
    upsertMany: playersAdapter.upsertMany,
    upsertOne: playersAdapter.upsertOne,
    removeOne: playersAdapter.removeOne,
    reset: () => playersAdapter.getInitialState(),
    /** Set is_host=true for player with given user_id, is_host=false for all others */
    setHostByUserId: (state, action: { payload: number }) => {
      const newHostUserId = action.payload;
      for (const id of state.ids) {
        const player = state.entities[id];
        if (player) {
          player.is_host = Number(player.user_id) === Number(newHostUserId);
        }
      }
    },
    /** Set is_host=true for player with given player id, is_host=false for all others */
    setHostByPlayerId: (state, action: { payload: number }) => {
      const newHostPlayerId = action.payload;
      console.log(
        '[setHostByPlayerId] Setting host to player_id:',
        newHostPlayerId,
      );
      for (const id of state.ids) {
        const player = state.entities[id];
        if (player) {
          const wasHost = player.is_host;
          player.is_host = Number(player.id) === Number(newHostPlayerId);
          if (player.is_host && !wasHost) {
            console.log('[setHostByPlayerId] Player became host:', {
              player_id: player.id,
              user_id: player.user_id,
              name: player.name,
            });
          }
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
} = playersSlice.actions;

export default playersSlice.reducer;

export const selectPlayersState = (state: RootState) => state.players;

export const {
  selectAll: selectAllPlayers,
  selectById: selectPlayerById,
  selectIds: selectPlayerIds,
  selectEntities: selectPlayerEntities,
} = playersAdapter.getSelectors<RootState>(selectPlayersState);

export const selectPlayerIdByUserId = (
  state: RootState,
  userId: number | null | undefined,
) => {
  if (userId == null) return null;
  const entities = selectPlayerEntities(state);

  for (const player of Object.values(entities)) {
    if (!player) continue;
    if (Number(player.user_id) === Number(userId)) {
      return player.id;
    }
  }

  return null;
};
