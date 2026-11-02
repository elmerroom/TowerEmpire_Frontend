import { useSelector } from 'react-redux';
import { getMasterId } from '@/store/fuflomicin/fuflSlice';
import { selectAllGamePlayers } from '@/entities/player/model/gamePlayerSlice';
import styles from './MasterInfo.module.scss';

export const MasterInfo = () => {
  const masterId = useSelector(getMasterId);
  const players = useSelector(selectAllGamePlayers);

  const master =
    masterId != null
      ? players.find((p: any) => Number(p.id) === Number(masterId))
      : null;

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Ведущий:</span>
      <span className={styles.name}>
        {master ? master.name : 'Ожидание...'}
      </span>
    </div>
  );
};
