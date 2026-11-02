import { GAME_PHASES, GamePhase } from './gamePhase';
import { GAME_STATUS, GameStatus } from './gameStatus';

type GameStateKey = GamePhase | GameStatus;

// Тексты статусов для Фуфломицина
export const FUFL_STATUS_TEXTS: Partial<Record<GameStateKey, string>> & {
  default: string;
} = {
  [GAME_PHASES.WAITING]: 'Ожидание',
  [GAME_PHASES.PLAYING]: 'Игра началась',
  [GAME_PHASES.PLAYER_SUBMISSION]: 'Игроки выбирают карты...',
  [GAME_PHASES.END_PLAYER_SUBMISSION]: 'Все ответили',
  [GAME_PHASES.REVEAL_SUBMISSIONS]: 'Ведущий выбирает...',
  [GAME_PHASES.REVEAL_MASTER_SELECTION]: 'Показ результатов',
  [GAME_PHASES.NEXT_ROUND]: 'Следующий раунд',
  [GAME_PHASES.FINISH_GAME]: 'Игра окончена',

  [GAME_STATUS.PAUSED]: 'Пауза',
  default: 'Игра началась',
};
