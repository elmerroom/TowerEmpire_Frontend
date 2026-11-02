import { motion } from 'framer-motion';
import './LobbySkeletonRow.scss';
// Для лучшего UI и как идея, добавил скелетоны
export const LobbySkeletonRow = () => {
  return (
    <tr className="lobby-skeleton__row">
      <td scope="row" className="mobile-none tablet-none">
        <motion.div
          className="skeleton-block skeleton-number"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </td>
      <td>
        <motion.div
          className="skeleton-block skeleton-locker"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </td>
      <td className="table-lobby__name">
        <motion.div
          className="skeleton-block skeleton-title"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </td>
      <td className="mobile-none">
        <motion.div
          className="skeleton-block skeleton-host"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </td>
      <td>
        <motion.div
          className="skeleton-block skeleton-players"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </td>
      <td>
        <motion.div
          className="skeleton-block skeleton-game-name"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </td>
      <td className="text-center">
        <motion.div
          className="skeleton-block skeleton-button"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </td>
    </tr>
  );
};
