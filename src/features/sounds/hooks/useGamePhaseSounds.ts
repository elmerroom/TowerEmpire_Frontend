import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGameMusic } from '../../gameMusic/hooks/useGameMusic';
import useSound from './useSound';
import {
  GAME_PHASE_SOUNDS,
  type GameType,
} from '../const/gamePhaseSoundsConfig';
import type { RootState } from '@/store/store';

export interface UseGamePhaseSoundsOptions {
  /** Тип игры */
  game: GameType;
}

export const useGamePhaseSounds = ({
  game,
}: UseGamePhaseSoundsOptions): void => {
  // config — всегда валиден (дефолт на случай неизвестной игры)
  const config = GAME_PHASE_SOUNDS[game] ?? GAME_PHASE_SOUNDS.bj;

  // ── Все useSelector ──
  const gamePhase = useSelector<RootState, string>(config.selectPhase);
  const gameId = useSelector<RootState, number | null>(config.selectGameId);
  const audioUrl = useSelector<RootState, string | null>(config.selectAudioUrl);
  const audioId = useSelector<RootState, number | null>(config.selectAudioId);

  const prevPhaseRef = useRef<string | undefined>(undefined);
  const prevGameIdRef = useRef<number | null | undefined>(undefined);
  const prevAudioIdRef = useRef<number | null>(null);

  const playStartGame = useSound(config.startSound);
  const playEndGame = useSound(config.endSound);
  const playAudio = useSound(audioUrl ? `/${audioUrl}` : null);

  const { play: playMusic, stop: stopMusic, isMusicEnabled } = useGameMusic();

  // ── Предупреждение о неизвестной игре ──
  useEffect(() => {
    if (!GAME_PHASE_SOUNDS[game]) {
      console.warn(`[useGamePhaseSounds] unknown game: ${game}`);
    }
  }, [game]);

  useEffect(() => {
    const prevGameId = prevGameIdRef.current;

    // Старт игры
    const gameChanged = gameId != null && prevGameId !== gameId;
    if (gameChanged) {
      playStartGame.play();
      if (isMusicEnabled) playMusic();
    }

    // Сброс игры
    const wasActive = prevGameId != null;
    const nowInactive = gameId == null;
    if (wasActive && nowInactive) {
      stopMusic();
      playStartGame.stop();
      playEndGame.stop();
    }

    prevGameIdRef.current = gameId ?? null;
  }, [
    gameId,
    isMusicEnabled,
    playStartGame,
    playEndGame,
    playMusic,
    stopMusic,
  ]);

  // ── Фазовые переходы: финал и реконнект ──
  useEffect(() => {
    if (gamePhase === prevPhaseRef.current) return;

    if (gamePhase === config.finishPhase) {
      stopMusic();
      playEndGame.play();
    } else if (
      config.reconnectionPhase &&
      gamePhase === config.reconnectionPhase
    ) {
      if (isMusicEnabled) playMusic();
    }

    prevPhaseRef.current = gamePhase;
  }, [
    gamePhase,
    isMusicEnabled,
    stopMusic,
    playEndGame,
    playMusic,
    config.finishPhase,
    config.reconnectionPhase,
  ]);

  // ── Звук события ──
  useEffect(() => {
    if (!audioId) return;
    if (prevAudioIdRef.current === audioId) return;
    prevAudioIdRef.current = audioId;
    playAudio.play();
  }, [audioId, playAudio]);
};

export default useGamePhaseSounds;
