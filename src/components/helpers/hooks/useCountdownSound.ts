import { RootState } from '../../../store/store';
import {
  selectIsSoundsEnabled,
  selectSoundsVolume,
} from '../../../features/gameMusic/model/audioSettingsSlice';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

interface Options {
  /** Оставшиеся секунды */
  count: number;
  /** Идёт ли отсчёт */
  isActive: boolean;
  /** Текущая фаза игры */
  phase?: string | null;
  /** Фазы, в которых звук нужен */
  phases?: string[];
  /** Порог, с которого начинаем пищать */
  threshold?: number;
  /** Путь к звуку */
  soundUrl: string;
  /** Текущий раунд игры */
  roundId?: number | null;
}

export const useCountdownSound = ({
  count,
  isActive,
  phase,
  phases,
  threshold = 5,
  soundUrl,
  roundId,
}: Options) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedSecondRef = useRef<number | null>(null);

  const isSoundsEnabled = useSelector((state: RootState) =>
    selectIsSoundsEnabled(state),
  );
  const soundsVolume = useSelector((state: RootState) =>
    selectSoundsVolume(state),
  );

  const soundsVolumeRef = useRef(soundsVolume);

  useEffect(() => {
    soundsVolumeRef.current = soundsVolume;
    if (audioRef.current) {
      audioRef.current.volume = soundsVolume;
    }
  }, [soundsVolume]);

  useEffect(() => {
    const audio = new Audio(soundUrl);
    audio.preload = 'auto';
    audio.volume = soundsVolumeRef.current;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [soundUrl]);

  // Основная логика: пищим на каждой секунде <= threshold
  useEffect(() => {
    const alreadySeen = lastPlayedSecondRef.current === count;
    lastPlayedSecondRef.current = count;
    if (alreadySeen) return;
    if (!isSoundsEnabled) return;
    if (soundsVolumeRef.current <= 0) return;
    if (!isActive) return;
    if (phase && phases && !phases.includes(phase)) return;
    if (count <= 0 || count > threshold) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = soundsVolumeRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [count, isActive, phase, phases, threshold, isSoundsEnabled]);

  // Сброс «последней секунды» при смене фазы/раунда
  useEffect(() => {
    lastPlayedSecondRef.current = null;
  }, [phase, roundId]);
};
