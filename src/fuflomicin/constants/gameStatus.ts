export const GAME_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
