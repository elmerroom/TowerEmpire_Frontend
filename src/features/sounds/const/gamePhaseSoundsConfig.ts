// src/features/sounds/const/gamePhaseSoundsConfig.ts
import type { RootState } from '@/store/store';
import { startGameSound, endGameSound } from './sounds';
import {
  selectGameId as selectBjGameId,
  selectPhase as selectBjPhase,
  selectQuestion,
} from '@/entities/game/model/gameBjSlice';
import {
  getGameId as selectFuflGameId,
  getGamePhase as selectFuflPhase,
} from '@/store/fuflomicin/fuflSlice';

/** Тип селектора состояния */
type Selector<T> = (state: RootState) => T;

/** Конфиг звуков для одной игры */
export interface GamePhaseSoundsConfig {
  /** Селектор текущей фазы игры */
  selectPhase: Selector<string>;
  /** Селектор gameId — для определения активности игры */
  selectGameId: Selector<number | null>;
  /** Селектор URL динамического звука (озвучка карты, вопрос, событие) */
  selectAudioUrl: Selector<string | null>;
  /** Селектор ID динамического звука — для защиты от повторов */
  selectAudioId: Selector<number | null>;
  /** Звук старта игры */
  startSound: string;
  /** Звук конца игры */
  endSound: string;
  /** Фаза, соответствующая финалу игры */
  finishPhase: string;
  /** Фаза реконнекта (опционально) */
  reconnectionPhase?: string;
}

/** Тип игры */
export type GameType = 'bj' | 'fufl';

/** Конфиг звуков для всех игр */
export const GAME_PHASE_SOUNDS: Record<GameType, GamePhaseSoundsConfig> = {
  bj: {
    selectPhase: selectBjPhase,
    selectGameId: selectBjGameId,
    selectAudioUrl: state => selectQuestion(state)?.audio ?? null,
    selectAudioId: state => selectQuestion(state)?.id ?? null,
    startSound: startGameSound,
    endSound: endGameSound,
    finishPhase: 'finish_game',
  },

  fufl: {
    selectPhase: selectFuflPhase,
    selectGameId: selectFuflGameId,
    // Заглушки — у Фуфломицина нет динамического звука
    selectAudioUrl: () => null,
    selectAudioId: () => null,
    startSound: startGameSound,
    endSound: endGameSound,
    finishPhase: 'FINISH_GAME',
  },
};
