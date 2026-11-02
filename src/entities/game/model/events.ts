// src/entities/game-bj/model/events.ts

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket Event types (event / type fields from backend)
// ─────────────────────────────────────────────────────────────────────────────
export const EV_PRE_START = 'pre_start' as const;
export const EV_START_GAME = 'start_game' as const;
export const EV_ALL_PLAYERS = 'all_players' as const;
export const EV_START_ROUND = 'start_round' as const;
export const EV_START_PHASE_PLAYER_CHOICE =
  'start_phase_player_choice_card' as const;
export const EV_COMMENTATOR = 'commentator' as const; // это type, не event
export const EV_ALL_SELECTED_PLAYER_CARD = 'all_selected_player_card';
export const EV_SHOW_SELECTED_CARDS = 'show_selected_cards' as const;
export const EV_END_PHASE_PLAYER_CHOICE =
  'end_phase_player_choice_card' as const;
export const EV_START_PHASE_MASTER_CHOICE =
  'start_phase_master_choice' as const;
export const EV_END_PHASE_MASTER_CHOICE = 'end_phase_master_choice' as const;
export const EV_SETTINGS = 'settings' as const;
export const EV_FINISH_GAME = 'finish_game' as const;

// ─────────────────────────────────────────────────────────────────────────────
// BJ Game statuses (gameBj.status)
// ─────────────────────────────────────────────────────────────────────────────
export const STATUS_IDLE = 'idle' as const;
export const STATUS_RUNNING = 'running' as const;
export const STATUS_PAUSED = 'paused' as const;

export type GameBjStatus =
  | typeof STATUS_IDLE
  | typeof STATUS_RUNNING
  | typeof STATUS_PAUSED;

// ─────────────────────────────────────────────────────────────────────────────
// BJ Game phases (gameBj.phase)
// ─────────────────────────────────────────────────────────────────────────────
export const PHASE_PLAYER_CHOICE = 'player_choice' as const;
export const PHASE_ALL_SELECTED_PLAYER_CARD =
  'all_selected_player_card' as const;
export const PHASE_SHOW_SELECTED_CARDS = 'show_selected_cards' as const;
export const PHASE_MASTER_CHOICE = 'master_choice' as const;
// intermission - мастер выбрал, показывается победитель, все видят результат
export const PHASE_INTERMISSION = 'intermission' as const;
export const PHASE_FINISH_GAME = 'finish_game' as const;
export const PHASE_WAITING = 'waiting' as const;
export const DEFAULT = 'default' as const;

export type GameBjPhase =
  | typeof PHASE_PLAYER_CHOICE
  | typeof PHASE_MASTER_CHOICE
  | typeof PHASE_INTERMISSION
  | typeof PHASE_ALL_SELECTED_PLAYER_CARD
  | typeof PHASE_SHOW_SELECTED_CARDS
  | typeof PHASE_FINISH_GAME
  | typeof PHASE_WAITING
  | typeof DEFAULT;
