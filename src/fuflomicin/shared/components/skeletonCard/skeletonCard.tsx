import { motion } from 'framer-motion';
import { useMemo } from 'react';
import styles from './skeletonCard.module.scss';

export type SkeletonType = 'word' | 'preposition';

interface SkeletonCardProps {
  type?: SkeletonType;
}

export const SkeletonCard = ({ type = 'word' }: SkeletonCardProps) => {
  // Slightly varying widths for words adds a more natural, realistic layout
  const width = useMemo(() => {
    if (type === 'preposition') return 121;
    return Math.floor(Math.random() * (160 - 90 + 1)) + 90;
  }, [type]);

  const classes =
    type === 'preposition'
      ? `${styles.skeletonCard} ${styles.button}`
      : styles.skeletonCard;

  return (
    <motion.div
      className={classes}
      style={{ width }}
      variants={{
        hidden: { opacity: 0, scale: 0.8, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0 },
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    />
  );
};
