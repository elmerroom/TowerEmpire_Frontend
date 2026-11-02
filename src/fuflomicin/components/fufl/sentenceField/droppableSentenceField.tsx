import { useDroppable } from '@dnd-kit/core';
import { SortableItem } from '../sortableItem/sortableItem';
import styles from './droppableSentenceField.module.scss';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { SentenceItem } from '@/fuflomicin/types';
import { getFinalSentenceToSubmit } from '@/store/fuflomicin/fuflSlice';
import { useSelector } from 'react-redux';
import { ActionButtons } from '../actionButtons/actionButtons';

type SentenceFieldProps = {
  onItemClick: (item: SentenceItem) => void;
  fieldId: string;
  items: SentenceItem[];
  isError: boolean;
  handleSend: () => void;
  disabled: boolean;
};

export function DroppableSentenceField({
  onItemClick,
  fieldId,
  items,
  isError,
  handleSend,
  disabled,
}: SentenceFieldProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: fieldId,
  });
  const finalSentence = useSelector(getFinalSentenceToSubmit);
  const baseBorderColor = '#ecb353';
  return (
    <ul className={styles.sentenceFieldWrapper}>
      <svg className={styles.goldenFrameSVGLeft}>
        <use href="/sprite.svg#sentence-decor-fufl-left"></use>
      </svg>
      <svg className={styles.goldenFrameSVGRight}>
        <use href="/sprite.svg#sentence-decor-fufl-right"></use>
      </svg>
      <motion.div
        ref={setNodeRef}
        animate={{
          x: isError ? [0, -4, 4, -4, 4, 0] : 0,
          borderColor: isError ? '#ff4d4f' : baseBorderColor,
          boxShadow: isError
            ? '0 0 10px rgba(255, 77, 79, 0.2)'
            : isOver
              ? '0 0 0 6px rgba(245, 221, 176, 0.18) inset, 0 10px 22px rgba(0, 0, 0, 0.08)'
              : '0 0 0 4px rgba(245, 221, 176, 0.12) inset',
          backgroundColor: isOver ? 'rgba(245, 221, 176, 0.18)' : undefined,
        }}
        transition={{ duration: 0.4 }}
        className={`${styles.sentenceFrame} ${isOver ? styles.sentenceFieldWrap__droppable : ''}`}
      >
        <ActionButtons handleSend={handleSend} disabled={disabled} />
        <AnimatePresence mode="wait">
          {finalSentence ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              className={styles.finalSentence}
            >
              {finalSentence}
            </motion.div>
          ) : (
            <SortableContext
              items={items.map(item => item.id)}
              strategy={rectSortingStrategy}
            >
              <motion.div layout className={styles.sentenceContainer}>
                {items.map(item => (
                  <motion.div layoutId={item.id} key={item.id}>
                    <SortableItem
                      isError={isError}
                      onClick={() => onItemClick(item)}
                      item={item}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </SortableContext>
          )}
        </AnimatePresence>
      </motion.div>
    </ul>
  );
}
