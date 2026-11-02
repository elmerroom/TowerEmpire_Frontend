import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

export interface GameSettingsState {
  scoreToWin: number;
  roundTime: number;
  masterTime: number;
  censorship: boolean;
  isPrivate: boolean;
  password: string;
}

const initialState: GameSettingsState = {
  scoreToWin: 6,
  roundTime: 30,
  masterTime: 15,
  censorship: false, // В зависимости от начальных установок на сервере
  isPrivate: false,
  password: '',
};

export interface UpdateSettingsPayload {
  scoreToWin?: number;
  roundTime?: number;
  masterTime?: number;
  censorship?: boolean;
}

export interface ServerSettingsPayload {
  player_round_second?: number;
  victory_points?: number;
  censorship?: boolean;
  count_card?: number;
  deck_size?: number | null;
  master_round_second?: number;
}

export const gameSettingsSlice = createSlice({
  name: 'gameSettings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<UpdateSettingsPayload>) => {
      if (action.payload.scoreToWin !== undefined) {
        state.scoreToWin = action.payload.scoreToWin;
      }
      if (action.payload.roundTime !== undefined) {
        state.roundTime = action.payload.roundTime;
      }
      if (action.payload.censorship !== undefined) {
        state.censorship = action.payload.censorship;
      }
      if (typeof action.payload.masterTime === 'number') {
        state.masterTime = action.payload.masterTime - 0.2;
      }
    },
    updateSettingsFromServer: (
      state,
      action: PayloadAction<ServerSettingsPayload>,
    ) => {
      if (
        action.payload.victory_points !== undefined &&
        action.payload.victory_points !== null
      ) {
        state.scoreToWin = action.payload.victory_points;
      }
      if (
        action.payload.player_round_second !== undefined &&
        action.payload.player_round_second !== null
      ) {
        state.roundTime = action.payload.player_round_second;
        // masterTime обычно меньше roundTime, если не пришёл master_round_second
        if (typeof action.payload.master_round_second !== 'number') {
          state.masterTime = Math.max(
            10,
            action.payload.player_round_second - 0.2,
          );
        }
      }
      if (
        action.payload.master_round_second !== undefined &&
        action.payload.master_round_second !== null &&
        Number.isFinite(Number(action.payload.master_round_second))
      ) {
        state.masterTime = Number(action.payload.master_round_second) - 0.2;
      }
      if (action.payload.censorship !== undefined) {
        state.censorship = action.payload.censorship;
      }
    },
    setCensorship: (state, action: PayloadAction<boolean>) => {
      state.censorship = action.payload;
    },
    updatePrivacy: (state, action: PayloadAction<{ isPrivate: boolean }>) => {
      state.isPrivate = Boolean(action.payload.isPrivate);
    },
    resetSettings: () => initialState,
  },
});

export const {
  updateSettings,
  updateSettingsFromServer,
  setCensorship,
  updatePrivacy,
  resetSettings,
} = gameSettingsSlice.actions;

// Селекторы
export const getGameSettings = (state: RootState): GameSettingsState =>
  state.gameSettings;

/**
 * Представление gameSettings в "серверной форме" для корректного smart-compare.
 * Это нужно, чтобы deep/version сравнение сравнивало сопоставимые структуры,
 * а не {scoreToWin,...} vs {victory_points,...}.
 */
export const getGameSettingsComparable = (state: RootState) => ({
  player_round_second: state.gameSettings.roundTime,
  victory_points: state.gameSettings.scoreToWin,
  censorship: state.gameSettings.censorship,
  master_round_second: state.gameSettings.masterTime,
});
export const getScoreToWin = (state: RootState): number =>
  state.gameSettings.scoreToWin;
export const getRoundTime = (state: RootState): number =>
  state.gameSettings.roundTime;
export const getMasterTime = (state: RootState): number =>
  state.gameSettings.masterTime;
export const getCensorship = (state: RootState): boolean =>
  state.gameSettings.censorship;
export const getIsPrivate = (state: RootState): boolean =>
  state.gameSettings.isPrivate;

export default gameSettingsSlice.reducer;
