import { memo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { selectGamePlayerById } from '@/entities/player/model/gamePlayerSlice';
import { getMasterId } from '@/store/fuflomicin/fuflSlice';
import styles from './Leader.module.scss';

interface LeaderProps {
  mockName?: string;
  nameColor?: string;
}

export const Leader = memo(({ mockName, nameColor }: LeaderProps) => {
  const masterId = useSelector(getMasterId);
  const masterPlayer = useSelector((state: RootState) =>
    selectGamePlayerById(state, masterId ?? -1),
  );
  const gameMode = useSelector((state: any) => state.modal.gameMode);
  const isHff = gameMode === 'hff';

  // Используем моковое имя если передано, иначе данные из Redux
  const masterPlayerName = mockName || masterPlayer?.name || 'Не выбран';

  return (
    <div
      className={`${styles.leader} ${isHff ? styles.hff : ''} ${masterPlayerName === 'Не выбран' ? styles.hide : ''}`}
    >
      <h6 className={styles.label}>Ведущий:</h6>
      <p
        className={styles.name}
        style={nameColor ? { color: nameColor } : undefined}
      >
        {masterPlayerName}
      </p>
    </div>
  );
});

Leader.displayName = 'Leader';
