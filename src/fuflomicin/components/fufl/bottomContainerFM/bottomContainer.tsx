import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import styles from './bottomContainer.module.scss';
import { DroppableSentenceField } from '../sentenceField/droppableSentenceField';
import { DroppableWordsField } from '../wordsField/droppableWordsField';
import { SortableItemOverlay } from '../sortableItemOverlay/sortableItemOverlay';
import {
  getFinalSentenceToSubmit,
  getGameStatus,
  getGamePhase,
  getPrepositions,
  getWordLimit,
  getWordsCurrentPlayer,
  moveItemToSentenceField,
  reorderItemsInSentence,
  setFinalSentenceToSubmit,
  getMasterId,
} from '@/store/fuflomicin/fuflSlice';
import { GAME_PHASES } from '@/fuflomicin/constants';

import { SentenceItem, Field } from '@/fuflomicin/types';
import { wsManager } from '@/websocket/WsManager';
import type { RootState } from '@/store/store';
import { getUserId } from '@/entities/user/model/slice';
import { selectGamePlayerIdByUserId } from '@/entities/player/model/gamePlayerSlice';

export const BottomContainer = () => {
  const dispatch = useDispatch();
  const [activeItem, setActiveItem] = useState<SentenceItem | null>(null);
  const [showError, setShowError] = useState(false);
  // Локальное состояние для активной сессии перетаскивания в поле SENTENCE
  const [localSentenceItems, setLocalSentenceItems] = useState<SentenceItem[]>(
    [],
  );

  // Redux selectors
  const words = useSelector(getWordsCurrentPlayer);
  const prepositions = useSelector(getPrepositions);
  const wordLimit = useSelector(getWordLimit) ?? 4;
  const finalSentence = useSelector(getFinalSentenceToSubmit);
  const masterId = useSelector(getMasterId);
  const userId = useSelector(getUserId);
  const myGamePlayerId = useSelector((state: RootState) =>
    selectGamePlayerIdByUserId(state, userId),
  );

  const gameStatus = useSelector(getGameStatus);
  const gamePhase = useSelector(getGamePhase);
  const isPaused = gameStatus === 'paused';

  const isMaster = Number(myGamePlayerId) === Number(masterId);
  const isSubmissionOver =
    gamePhase === GAME_PHASES.END_PLAYER_SUBMISSION ||
    gamePhase === GAME_PHASES.REVEAL_SUBMISSIONS ||
    gamePhase === GAME_PHASES.REVEAL_MASTER_SELECTION ||
    gamePhase === GAME_PHASES.NEXT_ROUND ||
    gamePhase === GAME_PHASES.FINISH_GAME;
  const isLocked = !!finalSentence || isMaster || isPaused || isSubmissionOver;
  const PREPOSITION_LIMIT = 1;

  // Элементы для SENTENCE
  const sentenceFieldItems: SentenceItem[] = useMemo(() => {
    return [
      ...words.filter(w => w.field === 'SENTENCE'),
      ...prepositions.filter(p => p.field === 'SENTENCE'),
    ].sort((a, b) => a.order - b.order);
  }, [words, prepositions]);

  // Синхронизация локального состояния с Redux, когда НЕ выполняется перетаскивание
  useEffect(() => {
    if (!activeItem) {
      setLocalSentenceItems(sentenceFieldItems);
    }
  }, [sentenceFieldItems, activeItem]);

  // Элементы для поля WORDS
  const wordFieldWords = useMemo(
    () =>
      words.filter(w => w.field === 'WORDS').sort((a, b) => a.order - b.order),
    [words],
  );

  // Элементы для PICKER
  const pickerFieldPreps = useMemo(
    () =>
      prepositions
        .filter(p => p.field === 'PICKER')
        .sort((a, b) => a.order - b.order),
    [prepositions],
  );

  const sentenceWordsCount = useMemo(
    () => words.filter(w => w.field === 'SENTENCE').length,
    [words],
  );

  const sentencePrepositionsCount = useMemo(
    () => prepositions.filter(p => p.field === 'SENTENCE').length,
    [prepositions],
  );

  const triggerLimitReached = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 600);
  };

  const handleSend = () => {
    // Проверка на минимальное количество слов
    if (sentenceWordsCount < 2) {
      triggerLimitReached();
      return;
    }

    // Проверка на минимальное количество предлогов
    if (sentencePrepositionsCount > 1) {
      triggerLimitReached();
      return;
    }

    if (sentenceFieldItems.length === 0) return;

    // Превращаем массив объектов в массив строк, затем в строку
    const fullString = sentenceFieldItems
      .map(item => {
        if (item.type === 'WORD') {
          return item.variants[item.selectedIndex];
        }
        return item.text;
      })
      .join(' ');
    // Первая буква заглавная, остальные маленькие
    const formattedSentence =
      fullString.charAt(0).toUpperCase() + fullString.slice(1).toLowerCase();

    // Формируем payload для отправки
    // Используем индекс массива для order, чтобы гарантировать
    // последовательные значения 1, 2, 3 вместо ненадежного item.order
    const selectedCards: { card_id: number; order: number; word: string }[] =
      [];
    let preposition: { card_id: number; order: number } | null = null;

    sentenceFieldItems.forEach((item, index) => {
      if (item.type === 'WORD') {
        selectedCards.push({
          card_id: Number(item.id),
          order: index + 1,
          word: item.variants[item.selectedIndex] ?? '',
        });
      } else if (item.type === 'PREPOSITION') {
        preposition = {
          card_id: Number(item.id),
          order: index + 1,
        };
      }
    });

    const payload: any = {
      command: 'check_choice_player_card_fm',
      selected_cards: selectedCards,
    };

    if (preposition) {
      payload.preposition = preposition;
    }

    wsManager.send(payload);

    dispatch(setFinalSentenceToSubmit(formattedSentence));

    console.log('Результат:', formattedSentence);
    console.log('Payload:', { selectedCards, phrase: formattedSentence });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleSortableItemClick = (item: SentenceItem) => {
    if (isLocked) return;
    // Если пытаемся добавить СЛОВО и лимит превышен
    if (
      item.field !== 'SENTENCE' &&
      item.type === 'WORD' &&
      sentenceWordsCount >= wordLimit
    ) {
      return triggerLimitReached();
    }

    // Preposition limit check
    if (
      item.field !== 'SENTENCE' &&
      item.type === 'PREPOSITION' &&
      sentencePrepositionsCount >= PREPOSITION_LIMIT
    ) {
      return triggerLimitReached();
    }

    // Определяем "домашнее" поле для возврата
    const homeField: Field = item.type === 'WORD' ? 'WORDS' : 'PICKER';
    // Если элемент в SENTENCE - отправляем домой, иначе - в SENTENCE
    const targetField: Field =
      item.field === 'SENTENCE' ? homeField : 'SENTENCE';

    dispatch(
      moveItemToSentenceField({
        id: item.id,
        type: item.type,
        targetField,
      }),
    );
  };

  function handleDragStart(event: DragStartEvent) {
    if (isLocked) return;
    const { active } = event;
    const draggedItem = active.data.current?.item as SentenceItem;
    if (draggedItem) {
      setActiveItem(draggedItem);
      // Инициализируем локальное состояние текущими элементами предложения при начале перетаскивания
      setLocalSentenceItems(sentenceFieldItems);
    }
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (isLocked || !over) {
      // If not over anything, remove from sentence so it doesn't show in 2 places
      setLocalSentenceItems(prev => prev.filter(item => item.id !== active.id));
      return;
    }

    const draggedItem = active.data.current?.item as SentenceItem;
    if (!draggedItem) return;

    const overId = over.id;

    // Check if we are over the sentence field
    const isOverSentence =
      overId === 'SENTENCE' ||
      localSentenceItems.some(item => item.id === overId);

    if (!isOverSentence) {
      // REMOVE: If we are over WORDS or PICKER, remove shadow from sentence
      setLocalSentenceItems(prev => prev.filter(item => item.id !== active.id));
      return;
    }

    // SORT / INSERT: If we are over the sentence, show shadow
    const oldIndex = localSentenceItems.findIndex(i => i.id === active.id);
    const newIndex = localSentenceItems.findIndex(i => i.id === overId);

    if (oldIndex !== -1) {
      // Reorder existing shadow
      if (oldIndex !== newIndex && newIndex !== -1) {
        setLocalSentenceItems(items => arrayMove(items, oldIndex, newIndex));
      }
    } else {
      // Insert new shadow from WORDS/PICKER
      if (draggedItem.type === 'WORD' && sentenceWordsCount >= wordLimit) {
        triggerLimitReached();
        return;
      }

      if (
        draggedItem.type === 'PREPOSITION' &&
        sentencePrepositionsCount >= PREPOSITION_LIMIT
      ) {
        triggerLimitReached();
        return;
      }

      setLocalSentenceItems(items => {
        const insertIndex = newIndex === -1 ? items.length : newIndex;
        const updated = [...items];
        updated.splice(insertIndex, 0, { ...draggedItem });
        return updated;
      });
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (isLocked) return;
    setActiveItem(null);

    const draggedItem = active.data.current?.item as SentenceItem;
    if (!draggedItem) {
      setLocalSentenceItems(sentenceFieldItems);
      return;
    }

    const wasInSentence = sentenceFieldItems.some(i => i.id === active.id);
    const isInSentenceNow = localSentenceItems.some(i => i.id === active.id);

    if (
      wasInSentence &&
      (!isInSentenceNow || over?.id === 'WORDS' || over?.id === 'PICKER')
    ) {
      // Prevent prepositions from entering WORDS
      if (draggedItem.type === 'PREPOSITION' && over?.id === 'WORDS') {
        setLocalSentenceItems(sentenceFieldItems);
        return;
      }

      const targetField = draggedItem.type === 'WORD' ? 'WORDS' : 'PICKER';
      dispatch(
        moveItemToSentenceField({
          id: active.id,
          type: draggedItem.type,
          targetField: targetField,
        }),
      );
      return;
    }

    // Dropped into sentence (insert / reorder)
    if (isInSentenceNow) {
      if (!wasInSentence) {
        dispatch(
          moveItemToSentenceField({
            id: active.id,
            type: draggedItem.type,
            targetField: 'SENTENCE',
          }),
        );
      }
      dispatch(
        reorderItemsInSentence({
          finalOrder: localSentenceItems.map(i => i.id),
        }),
      );
      return;
    }

    setLocalSentenceItems(sentenceFieldItems);
  }

  return (
    <div className={styles.bottomContainer}>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <DroppableSentenceField
          onItemClick={handleSortableItemClick}
          fieldId="SENTENCE"
          items={activeItem ? localSentenceItems : sentenceFieldItems}
          isError={showError}
          handleSend={handleSend}
          disabled={isLocked}
        />
        <DroppableWordsField
          onWordClick={handleSortableItemClick}
          fieldId="WORDS"
          words={wordFieldWords}
          prepositions={pickerFieldPreps}
          disabled={isLocked}
        />
        <DragOverlay dropAnimation={null}>
          {activeItem ? <SortableItemOverlay item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
      {/* <ActionButtons handleSend={handleSend} disabled={isLocked} /> */}
    </div>
  );
};
