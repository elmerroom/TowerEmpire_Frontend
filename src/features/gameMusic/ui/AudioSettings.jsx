import { useState } from 'react';
import { volumeButton } from '../const/gameMusic';
import styles from './AudioSettings.module.scss';
import { GameMusicForm } from './GameMusicForm';
import { Button } from '../../../shared/ui/Button';

export const AudioSettings = () => {
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <Button
        className={styles.btn}
        onClick={e => {
          e.preventDefault();
          setIsAudioSettingsOpen(true);
        }}
      >
        <img src={volumeButton} alt="Настройки воспроизведения" />
      </Button>
      {isAudioSettingsOpen && (
        <GameMusicForm onClose={() => setIsAudioSettingsOpen(false)} />
      )}
    </div>
  );
};
