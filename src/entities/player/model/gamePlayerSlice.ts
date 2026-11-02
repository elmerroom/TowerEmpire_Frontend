import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { GamePlayer, GameType } from './types';

type GamePlayersState = ReturnType<typeof adapter.getInitialState> & {
  gameType: GameType | null;
  gameId: number | null;
  waitingForPlayersEndTimestamp: number | null;
};

const adapter = createEntityAdapter<GamePlayer, number>({
  selectId: p => p.id,
});

const initialEntities = adapter.getInitialState();

const initialState: GamePlayersState = {
  ...initialEntities,
  gameType: null,
  gameId: null,
  waitingForPlayersEndTimestamp: null,
};

const slice = createSlice({
  name: 'gamePlayers',
  initialState,
  reducers: {
    setGameMeta(
      state,
      action: PayloadAction<{
        gameType: GameType | null;
        gameId: number | null;
      }>,
    ) {
      state.gameType = action.payload.gameType;
      state.gameId = action.payload.gameId;
    },
    setAll(state, action: PayloadAction<GamePlayer[]>) {
      adapter.setAll(state, action.payload);
    },
    upsertMany(state, action: PayloadAction<GamePlayer[]>) {
      adapter.upsertMany(state, action.payload);
    },
    upsertOne(state, action: PayloadAction<GamePlayer>) {
      adapter.upsertOne(state, action.payload);
    },
    removeOne(state, action: PayloadAction<number>) {
      adapter.removeOne(state, action.payload);
    },
    removeByUserId(state, action: PayloadAction<number>) {
      const player = Object.values(state.entities).find(
        p => p && Number(p.user_id) === action.payload,
      );
      if (player && player.id !== undefined) {
        adapter.removeOne(state, player.id);
      }
    },
    removeNotInLobby(
      state,
      action: PayloadAction<{
        lobbyPlayerIds: number[];
        userIds: number[];
      }>,
    ) {
      const lobbyPlayerIds = new Set(
        action.payload.lobbyPlayerIds.map(Number).filter(id => id > 0),
      );
      const userIds = new Set(
        action.payload.userIds.map(Number).filter(id => id > 0),
      );

      for (const id of [...state.ids]) {
        const player = state.entities[id as number];
        if (!player) continue;

        const lobbyId = Number(player.player_id ?? 0);
        const userId = Number(player.user_id ?? 0);
        const stays =
          (lobbyId > 0 && lobbyPlayerIds.has(lobbyId)) ||
          (userId > 0 && userIds.has(userId));

        if (!stays) {
          adapter.removeOne(state, player.id);
        }
      }
    },
    setWaitingForPlayersEndTimestamp(
      state,
      action: PayloadAction<number | null>,
    ) {
      state.waitingForPlayersEndTimestamp = action.payload;
    },
    clear(state) {
      const cleared = adapter.getInitialState();
      state.ids = cleared.ids as any;
      state.entities = cleared.entities as any;
    },
    reset(state) {
      const cleared = adapter.getInitialState();
      state.ids = cleared.ids as any;
      state.entities = cleared.entities as any;
      state.gameType = null;
      state.gameId = null;
    },
  },
});

export const {
  setGameMeta,
  setAll,
  upsertMany,
  upsertOne,
  removeOne,
  removeByUserId,
  removeNotInLobby,
  setWaitingForPlayersEndTimestamp,
  clear,
  reset,
} = slice.actions;

export default slice.reducer;

export const selectGamePlayersState = (state: RootState) => state.gamePlayers;

export const {
  selectAll: selectAllGamePlayers,
  selectById: selectGamePlayerById,
  selectEntities: selectGamePlayerEntities,
  selectIds: selectGamePlayerIds,
} = adapter.getSelectors<RootState>(selectGamePlayersState);

export const selectWaitingForPlayersEndTimestamp = (state: RootState) =>
  selectGamePlayersState(state).waitingForPlayersEndTimestamp;

export const selectGamePlayerIdByUserId = (
  state: RootState,
  userId: number | null | undefined,
) => {
  if (userId == null) return null;
  const entities = selectGamePlayerEntities(state);
  for (const player of Object.values(entities)) {
    if (!player) continue;
    if (Number(player.user_id) === Number(userId)) return player.id;
  }
  return null;
};
