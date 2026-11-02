import React from 'react';
import { AddBotIcon } from '@/shared/ui/icons';
import { useAddBot } from '../api/useAddBot';
import styles from './AddBotButton.module.css';

export interface AddBotButtonProps {
  disabled?: boolean;
}

export const AddBotButton: React.FC<AddBotButtonProps> = ({ disabled }) => {
  const { addBot } = useAddBot();

  return (
    <div className={styles.addBotContainer}>
      <button
        className={styles.addBotBtn}
        onClick={addBot}
        disabled={disabled}
        aria-label="Add Bot"
        title="Добавить бота"
      >
        <AddBotIcon size={24} className={styles.icon} />
        Добавить Бота
      </button>
    </div>
  );
};
