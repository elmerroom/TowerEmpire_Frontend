import { useDroppable } from '@dnd-kit/core';
import { SortableItem } from '../sortableItem/sortableItem';
import styles from './droppableWordsField.module.scss';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Preposition, SentenceItem, Word } from '@/fuflomicin/types';
import { PrepositionPicker } from '../prepositionPicker/prepositionPicker';
import { SkeletonCard } from '../../../shared/components/skeletonCard/skeletonCard';
import { BoostyButton } from '@/fuflomicin/shared/components/BoostyButton/BoostyButton';
import { Chat } from '@/features/chat/chat';

type WordsFieldProps = {
  onWordClick: (item: SentenceItem) => void;
  fieldId: string;
  words: Word[];
  prepositions: Preposition[];
  disabled: boolean;
};

export function DroppableWordsField({
  onWordClick,
  fieldId,
  words,
  prepositions,
  disabled,
}: WordsFieldProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: fieldId,
  });

  const isLoading = words.length === 0;

  return (
    <div className={styles.wordsFieldWrapper}>
      <div
        className={`${styles.wordsFieldMain} ${isOver ? styles.wordsFieldMain__droppable : ''} ${disabled ? styles.wordsFieldMain__disabled : ''}`}
        ref={setNodeRef}
      >
        <SortableContext
          items={words.map(word => word.id)}
          strategy={horizontalListSortingStrategy}
        >
          <motion.ul
            layout
            className={styles.wordsContainer}
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {isLoading ? (
              <SkeletonCard type="preposition" />
            ) : (
              <PrepositionPicker
                onPrepClick={onWordClick}
                fieldId="PICKER"
                prepositions={prepositions}
                disabled={disabled}
              />
            )}

            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={`skeleton-word-${i}`} type="word" />
                ))
              : words.map(word => (
                  <motion.div layoutId={word.id} key={word.id}>
                    <SortableItem onClick={onWordClick} item={word} />
                  </motion.div>
                ))}
          </motion.ul>
        </SortableContext>
      </div>
      <div className={styles.wordsFieldSidebar}>
        <BoostyButton />
        <Chat type="FUFLOMICIN" />
      </div>
    </div>
  );
}
