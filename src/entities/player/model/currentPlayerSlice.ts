import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../store/store';
import type { LobbyPlayer, GamePlayer } from './types';

type CurrentContext = 'lobby' | 'bj' | 'fuf' | 'hff' | 'none';

type CurrentUnion = LobbyPlayer | GamePlayer;

interface CurrentPlayerState {
  current: CurrentUnion | null;
  context: CurrentContext;
}

const initialState: CurrentPlayerState = {
  current: null,
  context: 'none',
};

const slice = createSlice({
  name: 'currentPlayer',
  initialState,
  reducers: {
    setCurrentPlayer(
      state,
      action: PayloadAction<{
        player: CurrentUnion | null;
        context: CurrentContext;
      }>,
    ) {
      state.current = action.payload.player ?? null;
      state.context = action.payload.context ?? 'none';
    },
    resetCurrentPlayer(state) {
      state.current = null;
      state.context = 'none';
    },
    setIsHost(state, action: PayloadAction<boolean | null>) {
      if (!state.current) return;
      if (state.context !== 'lobby') return;
      const nextValue = Boolean(action.payload);
      const anyPlayer = state.current as any;
      if (anyPlayer.is_host === nextValue) return;
      anyPlayer.is_host = nextValue;
    },
    setContext(state, action: PayloadAction<CurrentContext>) {
      state.context = action.payload;
    },
  },
});

export const { setCurrentPlayer, resetCurrentPlayer, setIsHost, setContext } =
  slice.actions;
export default slice.reducer;

// -------- селекторы --------
export const selectCurrentPlayer = (s: { currentPlayer: CurrentPlayerState }) =>
  s.currentPlayer.current;

export const selectCurrentPlayerId = (s: {
  currentPlayer: CurrentPlayerState;
}) => s.currentPlayer.current?.id ?? null;
export const selectCurrentPlayerContext = (s: {
  currentPlayer: CurrentPlayerState;
}) => s.currentPlayer.context;

export { syncCurrentPlayer } from './syncCurrentPlayer';
