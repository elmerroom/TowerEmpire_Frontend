import { useSelector } from 'react-redux';
import { getPromptCard } from '@/store/fuflomicin/fuflSlice';
import styles from './Buyer.module.scss';

export const Buyer = () => {
  const promptCard = useSelector(getPromptCard);
  const buyerName = promptCard?.text || '';

  return (
    <div className={styles.buyer}>
      <h2 className={styles.buyerLabel}>Покупатель:&nbsp;</h2>
      <h4 className={styles.buyerName}>{buyerName}</h4>
    </div>
  );
};

Buyer.displayName = 'Buyer';
