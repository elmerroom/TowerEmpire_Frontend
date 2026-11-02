export type Field = 'WORDS' | 'SENTENCE' | 'PICKER';
export type ItemType = 'WORD' | 'PREPOSITION';

interface BaseItem {
  id: string;
  field: Field;
  order: number;
  type: ItemType;
}

export interface Word extends BaseItem {
  type: 'WORD';
  variants: string[];
  selectedIndex: number;
}

export interface Preposition extends BaseItem {
  type: 'PREPOSITION';
  text: string;
}

export type SentenceItem = Word | Preposition;

export interface GameSettings {
  victoryPoints: number;
  censorship: boolean;
  playerRoundSecond: number;
  masterRoundSecond?: number;
}

export interface Card {
  cardId: number;
  text: string;
  order?: boolean;
}

export interface Player {
  userId: number;
  username: string;
  points: number;
  isMaster?: boolean;
  isLeave?: boolean;
  isHost?: boolean;
  isOffline?: boolean;
  cards?: Card[];
}

export type PlayersMap = Record<number, Player>;

export type AnswerCardWire = {
  id: number;
  text?: string;
  player_id?: number;
  player_name?: string;
};

export interface RoundState {
  id: number;
  roundNumber: number | null;
  cardType: string;
  text: string;
  timerTime?: number;
}

export interface GameCondition {
  gameId: string | null;
  currentRound?: number | null;
  roundNumber?: number | null;
  roundQuestion?: string;
  gameStatus: 'pause' | 'resume' | null;
  gamePhase?: string;
}

export interface MappedPlayer {
  id: number | string;
  username: string;
  points: number;
  isMaster?: boolean;
  isHost?: boolean;
  isOffline?: boolean;
  joined_at?: string;
  cards?: Card[];
}
