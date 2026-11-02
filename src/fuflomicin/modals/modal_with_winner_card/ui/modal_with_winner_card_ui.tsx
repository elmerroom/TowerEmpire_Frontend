import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import styles from './modal_with_winner_card_ui.module.scss';
import { motion } from 'framer-motion';

export interface WinnerUI {
  name?: string;
  text?: string;
}

interface Props {
  winner: WinnerUI;
  isHff?: boolean;
}

export const ModalWithWinnerCardUI = ({ winner, isHff }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`d-flex flex-column justify-content-between mx-auto align-self-center ${styles.winnerCard} ${isHff ? styles.hff : ''}`}
    >
      <SimpleBar className={styles.answer}>
        <p className={`text-start m-0 fw-normal text-break ${styles.answer}`}>
          {winner.text ? winner.text : 'Нет карт'}
        </p>
      </SimpleBar>
      <p className={`text-end text-break ${styles.name}`}>{winner.name}</p>
    </motion.div>
  );
};
