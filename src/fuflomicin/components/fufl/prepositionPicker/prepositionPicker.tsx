import { useEffect, useRef, useState } from 'react';
import styles from './prepositionPicker.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { Preposition, SentenceItem } from '@/fuflomicin/types';
import { SortableItem } from '../sortableItem/sortableItem';

type OutsideClickElement = HTMLElement | null;
type Handler = () => void;

type PrepFieldProps = {
  onPrepClick: (item: SentenceItem) => void;
  fieldId: string;
  prepositions: Preposition[];
  disabled: boolean;
};

export function PrepositionPicker({
  onPrepClick,
  fieldId,
  prepositions,
  disabled,
}: PrepFieldProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: fieldId,
  });

  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const useOutsideClick = (
    ref: React.RefObject<OutsideClickElement>,
    callback: Handler,
  ) => {
    useEffect(() => {
      const handleClick = (e: MouseEvent | TouchEvent) => {
        if (
          ref.current &&
          !ref.current.contains(e.target as Node) &&
          !buttonRef.current?.contains(e.target as Node)
        ) {
          callback();
        }
      };

      document.addEventListener('mousedown', handleClick);
      return () => {
        document.removeEventListener('mousedown', handleClick);
      };
    }, [ref, callback]);
  };

  useOutsideClick(pickerRef, () => setOpen(false));

  return (
    <div
      className={`${styles.container} ${disabled ? styles.container__disabled : ''}`}
    >
      <motion.div
        key="button"
        whileHover={{
          filter: 'brightness(1.1)',
        }}
        whileTap={{
          y: 6,
          scale: 0.52,
        }}
        transition={{
          type: 'spring',
          stiffness: 600,
          damping: 12,
        }}
        onClick={() => setOpen(true)}
        className={styles.container__button}
        ref={buttonRef}
      >
        Предлоги
      </motion.div>

      {open && (
        <div key="modal" className={styles.container_modal}>
          <div ref={setNodeRef}>
            <SortableContext
              items={prepositions.map(p => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              <ul className={styles.container__picker} ref={pickerRef as any}>
                {prepositions.map(prep => (
                  <motion.div
                    layoutId={prep.id}
                    key={prep.id}
                    style={{
                      zIndex: 9999,
                      position: 'relative',
                      display: 'inline-block',
                    }}
                  >
                    <SortableItem onClick={onPrepClick} item={prep} />
                  </motion.div>
                ))}
              </ul>
            </SortableContext>
          </div>
        </div>
      )}
    </div>
  );
}
