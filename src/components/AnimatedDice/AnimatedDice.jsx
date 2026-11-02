import { motion } from 'framer-motion';
import styles from './AnimatedDice.module.scss';

export const AnimatedDice = () => {
  return (
    <div className={styles.diceContainer}>
      <motion.div
        className={styles.dice}
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Передняя грань (1 точка) */}
        <div className={`${styles.face} ${styles.front}`}>
          <div className={styles.dot}></div>
        </div>

        {/* Задняя грань (6 точек) */}
        <div className={`${styles.face} ${styles.back}`}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>

        {/* Правая грань (3 точки) */}
        <div className={`${styles.face} ${styles.right}`}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>

        {/* Левая грань (4 точки) */}
        <div className={`${styles.face} ${styles.left}`}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>

        {/* Верхняя грань (5 точек) */}
        <div className={`${styles.face} ${styles.top}`}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>

        {/* Нижняя грань (2 точки) */}
        <div className={`${styles.face} ${styles.bottom}`}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      </motion.div>
    </div>
  );
};
