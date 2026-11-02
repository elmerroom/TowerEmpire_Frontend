import styles from './sortableItem.module.scss';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setWordVariant } from '@/store/fuflomicin/fuflSlice';
import { SentenceItem } from '@/fuflomicin/types';

type SortableItemProps = {
  onClick: (item: SentenceItem) => void;
  item: SentenceItem;
  isError?: boolean;
};

type OutsideClickElement = HTMLElement | null;
type Handler = () => void;

export const SortableItem = ({
  item,
  onClick,
  isError = false,
}: SortableItemProps) => {
  if (!item) return null;
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: item.type,
      item: item,
    },
  });

  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'pointer',
    touchAction: 'none',
  };

  const onClickSelect = (i: number) => {
    if (item.type === 'WORD') {
      dispatch(
        setWordVariant({
          wordId: item.id,
          selectedIndex: i,
        }),
      );
      setOpen(false);
    }
  };

  const useOutsideClick = (
    ref: React.RefObject<OutsideClickElement>,
    callback: Handler,
  ) => {
    useEffect(() => {
      const handleClick = (e: MouseEvent | TouchEvent) => {
        if (
          ref.current &&
          !ref.current.contains(e.target as Node) &&
          !labelRef.current?.contains(e.target as Node)
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

  useOutsideClick(listRef, () => setOpen(false));

  return (
    <motion.li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={() => onClick(item)}
      className={styles.container}
      animate={{
        x: isError ? [0, -2, 2, -2, 2, 0] : 0,
      }}
    >
      <div className={styles.itemWrapper}>
        {/* Рендерим arrow и текст только если это СЛОВО */}
        {item.type === 'WORD' ? (
          <>
            <span className={styles.itemWrapper__text}>
              {item.variants[item.selectedIndex]}
            </span>
            <div
              className={styles.arrowWrapper}
              onClick={e => {
                e.stopPropagation();
                setOpen(!open);
              }}
              ref={labelRef as any}
            >
              <motion.svg
                className={styles.arrowSVG}
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <use href="/sprite.svg#dropdown-arrow"></use>
              </motion.svg>
            </div>
          </>
        ) : (
          // Рендерим просто текст если это ПРЕДЛОГ
          <span className={styles.itemWrapper__text}>{item.text}</span>
        )}
      </div>
      {/* Выпадающий список только для СЛОВА */}
      <AnimatePresence>
        {item.type === 'WORD' && open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 22,
            }}
            className={styles.dropdownList}
            ref={listRef}
          >
            <ul
              className={`${styles.listContainer} ${open && styles.listContainer__open}`}
            >
              {item.variants.map((name, i) => (
                <li
                  key={i}
                  className={
                    item.selectedIndex === i ? `${styles.selected}` : ''
                  }
                  onClick={e => {
                    e.stopPropagation();
                    onClickSelect(i);
                  }}
                >
                  {name}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};
