import { SentenceItem } from '@/fuflomicin/types';
import styles from './sortableItemOverlay.module.scss';

type ItemOverlayProps = {
  item: SentenceItem;
};

export const SortableItemOverlay = ({ item }: ItemOverlayProps) => {
  return (
    <li className={styles.container}>
      {item.type === 'WORD' ? (
        <span className={styles.container__text}>
          {item.variants[item.selectedIndex]}
        </span>
      ) : (
        <span className={styles.container__text}>{item.text}</span>
      )}
    </li>
  );
};
