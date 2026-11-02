import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { MUSIC_URL } from '../const/gameMusic';
import {
  selectIsMusicEnabled,
  selectMusicVolume,
} from '../model/audioSettingsSlice';

const MAX_RETRY_ATTEMPTS = 4;
const RETRY_BASE_DELAY = 5000;

export interface UseGameMusicOptions {
  selectGameId?: (state: RootState) => number | null;
}

export interface UseGameMusicReturn {
  /** Запустить музыку вручную */
  play: () => void;
  /** Остановить музыку вручную */
  stop: () => void;
  /** Включена ли музыка в настройках */
  isMusicEnabled: boolean;
}

/** Дефолтный селектор — проверяет любую активную игру */
const defaultSelectGameId = (state: RootState): number | null => {
  // Проверяем все известные игры
  if (state.gameBj?.gameId != null) return state.gameBj.gameId;
  if (state.fuflGame?.gameId != null) return state.fuflGame.gameId;
  return null;
};

export const useGameMusic = ({
  selectGameId = defaultSelectGameId,
}: UseGameMusicOptions = {}): UseGameMusicReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isMusicEnabled = useSelector(selectIsMusicEnabled);
  const musicVolume = useSelector(selectMusicVolume);
  const gameId = useSelector(selectGameId);
  const isGameActive = Boolean(gameId);

  // ── Создание Audio (один раз при монтировании) ──
  useEffect(() => {
    if (!audioRef.current && typeof Audio !== 'undefined') {
      const audio = new Audio(MUSIC_URL);
      audio.loop = true;
      audio.volume = musicVolume;
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← пустые зависимости: Audio создаётся один раз

  // ── Громкость ──
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // ── Play/Pause + Retry ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isMusicEnabled || !isGameActive) {
      if (!audio.paused) audio.pause();
      return;
    }

    if (!audio.paused) return; // уже играет

    let cancelled = false;
    let attempt = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleError = (): void => {
      if (cancelled) return;

      const code = audio.error?.code;
      console.warn(`[music] attempt ${attempt} failed, code: ${code}`);

      if (attempt >= MAX_RETRY_ATTEMPTS) {
        console.warn('[music] max attempts reached');
        return;
      }

      const delay = attempt * RETRY_BASE_DELAY;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        audio.load();
        tryPlay();
      }, delay);
    };

    const tryPlay = (): void => {
      if (cancelled) return;
      attempt += 1;

      audio.addEventListener('error', handleError, { once: true });
      audio.play().catch((err: unknown) => {
        console.warn('[music] play() rejected:', err);
        handleError();
      });
    };

    tryPlay();

    return () => {
      cancelled = true;
      audio.removeEventListener('error', handleError);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [isMusicEnabled, isGameActive]);

  // ── Ручное управление ──
  const play = (): void => {
    const audio = audioRef.current;
    if (audio && isMusicEnabled) {
      audio.volume = musicVolume;
      audio.play().catch((err: unknown) => {
        console.warn('[music] play error:', err);
      });
    }
  };

  const stop = (): void => {
    const audio = audioRef.current;
    if (audio) audio.pause();
  };

  return { play, stop, isMusicEnabled };
};
