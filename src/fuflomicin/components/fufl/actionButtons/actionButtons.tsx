import { motion } from 'framer-motion';
import styles from './actionButtons.module.scss';
import { useDispatch } from 'react-redux';
import { resetSentence } from '@/store/fuflomicin/fuflSlice';

type ActionButtonsProps = {
  handleSend: () => void;
  disabled: boolean;
};

export const ActionButtons = ({ handleSend, disabled }: ActionButtonsProps) => {
  const dispatch = useDispatch();

  const handleReset = () => {
    dispatch(resetSentence());
  };

  return (
    <div
      className={`${styles.container} ${disabled ? styles.container__disabled : ''}`}
    >
      <div className={styles.container__buttons}>
        <motion.div
          whileHover={{
            scale: 1.02,
            filter: 'brightness(1.1)',
          }}
          whileTap={{
            y: 6,
            scale: 0.92,
          }}
          transition={{
            type: 'spring',
            stiffness: 600,
            damping: 15,
          }}
          onClick={handleSend}
        >
          <svg className={styles.send}>
            <use href="/sprite.svg#send-button-fufl"></use>
          </svg>
          {/* <div className={styles.wrapper}>
            <span>Отправить</span>
            <svg className={styles.sendSVG}>
              <use href="/sprite.svg#send-button-arrow-fufl"></use>
            </svg>
          </div> */}
        </motion.div>
        <motion.div
          onClick={handleReset}
          whileHover={{
            scale: 1.02,
            filter: 'brightness(1.1)',
          }}
          whileTap={{
            y: 6,
            scale: 0.92,
          }}
          transition={{
            type: 'spring',
            stiffness: 600,
            damping: 15,
          }}
        >
          <svg className={styles.reset}>
            <use href="/sprite.svg#reset-button-fufl"></use>
          </svg>
          {/* <div className={styles.wrapper}>
            <span>Сбросить</span>
            <svg className={styles.resetSVG}>
              <use href="/sprite.svg#reset-button-cross-fufl"></use>
            </svg>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
};
