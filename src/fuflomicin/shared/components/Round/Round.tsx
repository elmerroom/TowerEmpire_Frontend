import { memo } from 'react';
import { useSelector } from 'react-redux';
import styles from './Round.module.scss';
import { RootState } from '@/store/store';

interface RoundProps {
  mockRound?: number; // Моковый номер раунда
}

export const Round = memo(({ mockRound }: RoundProps) => {
  const currentRound = useSelector(
    (state: RootState) => state.fuflGame?.currentRound?.roundNumber,
  );
  const gameMode = useSelector((state: any) => state.modal.gameMode);
  const isHff = gameMode === 'hff';

  // Используем моковые данные если переданы
  const displayRound = mockRound ?? currentRound;

  return (
    <div className={`${styles.round} ${isHff ? styles.hff : ''}`}>
      {displayRound && (
        <h6 className={styles.roundNumber}>Раунд: {displayRound}</h6>
      )}
    </div>
  );
});

Round.displayName = 'Round';
