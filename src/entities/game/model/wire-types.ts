// src/entities/game-bj/model/wire-types.ts
import {
  EV_PRE_START,
  EV_START_GAME,
  EV_ALL_PLAYERS,
  EV_START_ROUND,
  EV_START_PHASE_PLAYER_CHOICE,
  EV_COMMENTATOR,
  EV_ALL_SELECTED_PLAYER_CARD,
  EV_SHOW_SELECTED_CARDS,
  EV_END_PHASE_PLAYER_CHOICE,
  EV_START_PHASE_MASTER_CHOICE,
  EV_END_PHASE_MASTER_CHOICE,
  EV_FINISH_GAME,
} from './events';

// pre_start — Сообщение при старте
export interface PreStartEvent {
  event: typeof EV_PRE_START;
  game_type?: string; // Тип игры: 'evil-cards', 'fuflomicin', etc.
}

/** StartGame: приходит сразу при запуске игры хостом */
export interface StartGameEvent {
  event: typeof EV_START_GAME;
  start_game: boolean;
  game_id: number;
  timestamp: string; // ISO
}

/** Игрок (ровно по проводу). avatar может быть null, сервер так шлёт. */
export interface PlayerWire {
  id: number;
  name: string;
  is_host: boolean;
  is_disconnect: boolean;
  avatar: string | null; // URL или null
  is_vip: boolean;
  points?: number;
  nickname_color?: string;
  user_id: number;
  room_id?: number;
  selected_cards?: SelectedCardWire[];
}

export interface SelectedCardWire {
  id: number;
  player_id: number;
  card_id: number;
  is_table: boolean;
  is_winner: boolean;
  // скоро появится: text?: string
  text?: string;
}
/** AllPlayers: актуальный состав игроков в игре */
export interface AllPlayersEvent {
  event: typeof EV_ALL_PLAYERS;
  players: PlayerWire[];
}

/** Дискриминированный союз для удобной сужающей проверки */
export type GameIncomingEvent = StartGameEvent | AllPlayersEvent;

export type QuestionCardWire = {
  id: number;
  text: string;
  is_censorship: boolean;
  type: 'QUESTION';
  answer_count_card: number;
  audio: string | null;
};

export type AnswerCardWire = {
  id: number;
  text: string;
  is_censorship: boolean;
  type: 'ANSWER';
  answer_count_card: null;
  audio: string | null;
};

export interface StartRoundEvent {
  event: typeof EV_START_ROUND;
  current_round: number;
  players: PlayerWire[];
  card: QuestionCardWire;
  timestamp: string;
  master_id: number;
  settings?: { player_round_second: number; master_round_second: number };
}

export interface StartPhasePlayerChoiceEvent {
  event: typeof EV_START_PHASE_PLAYER_CHOICE;
  start_phase_player_choice_card: true;
  time_round: number;
  timestamp: string;
}

export interface CommentatorMessage {
  type: typeof EV_COMMENTATOR;
  text: string;
}

export interface ShowSelectedCardsEvent {
  event: typeof EV_SHOW_SELECTED_CARDS;
  timestamp: string;
  /** playerId -> [cardId] */
  cards: Record<string, number[]>;
}

export interface EndPhasePlayerChoiceEvent {
  event: typeof EV_END_PHASE_PLAYER_CHOICE;
  end_phase_player_choice_card: true;
  timestamp: string;
}

export interface StartPhaseMasterChoiceEvent {
  event: typeof EV_START_PHASE_MASTER_CHOICE;
  timestamp: string;
  time_round: number;
}

export interface EndPhaseMasterChoiceEvent {
  event: typeof EV_END_PHASE_MASTER_CHOICE;
  timestamp: string;
  winner: AnswerCardWire;
}

export interface FinishGameEvent {
  event: typeof EV_FINISH_GAME;
  timestamp: string;
  users: PlayerWire[];
}

export interface AllSelectedPlayerCard {
  event?: typeof EV_ALL_SELECTED_PLAYER_CARD;
  game?: number;
  time: number;
}
export type FinishGamePayload = Omit<FinishGameEvent, 'event'>;
