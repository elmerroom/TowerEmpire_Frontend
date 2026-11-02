export const GAME_PHASES = {
  /** фаза ожидания */
  WAITING: 'WAITING',
  /** фаза игры */
  PLAYING: 'PLAYING',
  /** игроки делают выбор  */
  PLAYER_SUBMISSION: 'PLAYER_SUBMISSION',
  /** игроки сделали выбор */
  END_PLAYER_SUBMISSION: 'END_PLAYER_SUBMISSION',
  /** ведущий делает выбор */
  REVEAL_SUBMISSIONS: 'REVEAL_SUBMISSIONS',
  /** фаза отображения выбранных ведущим ответов */
  REVEAL_MASTER_SELECTION: 'REVEAL_MASTER_SELECTION',
  /** фаза завершения раунда */
  NEXT_ROUND: 'NEXT_ROUND',
  /** фаза завершения игры */
  FINISH_GAME: 'FINISH_GAME',
} as const;

export type GamePhase = (typeof GAME_PHASES)[keyof typeof GAME_PHASES];
