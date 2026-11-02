import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { motion } from 'framer-motion';
import styles from '../modal_with_winner_card.module.scss';

export const ModalWithWinnerCardUI = ({ winner }) => {
  // Определяем количество карт для отображения
  const cardCount = winner.text?.length || winner.cards?.length || 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`d-flex flex-column justify-content-between mx-auto align-self-center ${styles.winnerCard}`}
    >
      {cardCount === 0 ? (
        <p className={styles.answer}>Нет карт</p>
      ) : cardCount === 1 ? (
        // Одна карта
        <p className={styles.answer}>
          {winner.text?.[0] || winner.cards?.[0]?.text || ''}
        </p>
      ) : (
        // Несколько карт - отображаем все
        <div className={styles.couple}>
          {winner.text?.map((text, index) => (
            <SimpleBar key={index} className={styles.answer}>
              {text}
            </SimpleBar>
          )) ||
            winner.cards?.map((card, index) => (
              <SimpleBar key={index} className={styles.answer}>
                {card.text}
              </SimpleBar>
            ))}
        </div>
      )}
      <p className={styles.winner}>{winner.name}</p>
    </motion.div>
  );
};
