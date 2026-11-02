// src/features/sounds/hooks/useSound.ts
import { useCallback, useEffect, useRef } from 'react';
import { useStore } from 'react-redux';
import type { RootState } from '@/store/store';

export interface UseSoundReturn {
  play: () => void;
  stop: () => void;
}

export const useSound = (src: string | null | undefined): UseSoundReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const store = useStore<RootState>();

  useEffect(() => {
    if (typeof Audio === 'undefined' || !src) return;

    const audio = new Audio(src);
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  const play = useCallback(() => {
    const state = store.getState();
    const hasActiveGame =
      state.gameBj.gameId != null || state.fuflGame.gameId != null;
    const isSoundsEnabled = state.audioSettings.isSoundsEnabled;
    const volume = state.audioSettings.soundsVolume;
    const gameId = hasActiveGame;

    if (!isSoundsEnabled || !gameId) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch((err: unknown) => {
      console.warn('Не удалось воспроизвести звук:', err);
    });
  }, [store]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return { play, stop };
};

export default useSound;
