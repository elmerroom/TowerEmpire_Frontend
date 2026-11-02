import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToggleSwitchSound } from '../../../components/helpers/ToggleSwitchSound';
import { volumeMinus, volumeMute, volumePlus } from '../const/gameMusic';
import {
  setMusicVolume,
  setSoundsVolume,
  toggleMusic,
  toggleSounds,
} from '../model/audioSettingsSlice';
import styles from './GameMusicForm.module.scss';
import { Button } from '../../../shared/ui/Button';

export const GameMusicForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const formRef = useRef(null);

  const getVolumeIcon = (enabled, volume) => {
    if (!enabled) return volumeMute;
    return volume > 0 ? volumeMinus : volumeMute;
  };

  const clampVolume = value => {
    return Math.min(1, Math.max(0.01, Number(value.toFixed(2))));
  };

  const increaseVolume = (current, setter) => {
    const newVolume = clampVolume(current + 0.1);
    dispatch(setter(newVolume));
  };

  const decreaseVolume = (current, setter) => {
    const newVolume = clampVolume(current - 0.1);
    dispatch(setter(newVolume));
  };

  const { isMusicEnabled, musicVolume, isSoundsEnabled, soundsVolume } =
    useSelector(state => state.audioSettings);

  useEffect(() => {
    const handleClickOutside = event => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className={styles.dropdown} ref={formRef}>
      <p className={styles.title}>настройки аудио</p>
      <div className="modal-main__result__header_separator"></div>
      <Button
        className={`my-btn-close ${styles.exit}`}
        onClick={onClose}
        aria-label="Закрыть"
      >
        <img src="/img/cross.svg" alt="Закрыть" />
      </Button>

      <div className={styles.audioSettings}>
        {/* Музыка */}
        <div className={styles.section}>
          <div className={styles.row}>
            <span className={styles.label}>Музыка:</span>
            <ToggleSwitchSound
              id="toggle-music"
              checked={isMusicEnabled}
              onChange={() => dispatch(toggleMusic())}
            />
          </div>
          <p className={styles.volumeTitle}>Громкость:</p>
          <div className={styles.volumeRow}>
            <Button
              onClick={() => decreaseVolume(musicVolume, setMusicVolume)}
              disabled={!isMusicEnabled}
              className={styles.iconButton}
            >
              <img
                src={getVolumeIcon(isMusicEnabled, musicVolume)}
                alt="Регулировка громкости"
              />
            </Button>
            <input
              aria-valuemin="0"
              aria-valuemax="1"
              aria-orientation="horizontal"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={musicVolume}
              onChange={e => dispatch(setMusicVolume(Number(e.target.value)))}
              disabled={!isMusicEnabled}
            />
            <Button
              onClick={() => increaseVolume(musicVolume, setMusicVolume)}
              disabled={!isMusicEnabled}
              className={styles.iconButton}
            >
              <img src={volumePlus} alt="Увеличить" />
            </Button>
          </div>
        </div>

        {/* Звуки */}
        <div className={styles.section}>
          <div className={styles.row}>
            <span className={styles.label}>Звуки:</span>
            <ToggleSwitchSound
              id="toggle-sounds"
              checked={isSoundsEnabled}
              onChange={() => dispatch(toggleSounds())}
            />
          </div>
          <p className={styles.volumeTitle}>Громкость:</p>
          <div className={styles.volumeRow}>
            <Button
              onClick={() => decreaseVolume(soundsVolume, setSoundsVolume)}
              disabled={!isSoundsEnabled}
              className={styles.iconButton}
            >
              <img
                src={getVolumeIcon(isSoundsEnabled, soundsVolume)}
                alt="Регулировка громкости"
              />
            </Button>
            <input
              aria-valuemin="0"
              aria-valuemax="1"
              aria-orientation="horizontal"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={soundsVolume}
              onChange={e => dispatch(setSoundsVolume(Number(e.target.value)))}
              disabled={!isSoundsEnabled}
            />
            <Button
              onClick={() => increaseVolume(soundsVolume, setSoundsVolume)}
              disabled={!isSoundsEnabled}
              className={styles.iconButton}
            >
              <img src={volumePlus} alt="Увеличить" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
