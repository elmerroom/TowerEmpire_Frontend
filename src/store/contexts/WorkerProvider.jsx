import { createContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { useWebSocket } from './WsRootProvider';
import {
  selectPhase as selectGamePhase,
  selectGameStatus,
  selectGameId,
} from '../../entities/game/model/gameBjSlice';
import {
  getIsTimerRun,
  getTimerTime,
  getCountOfAnswers,
  setTimerTime,
} from '../slices/game/gameSlice';

const selectChosenCardsStable = createSelector(
  state => state.game.chosenCardsCurrentPlayer,
  chosenCards =>
    Array.isArray(chosenCards) ? chosenCards.map(c => c.card_id) : [],
);

// eslint-disable-next-line react-refresh/only-export-components
export const WorkerContext = createContext(null);

export const WorkerProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { send, isOnline } = useWebSocket();

  const workerRef = useRef(null);
  const gamePhaseRef = useRef(null);
  const gameStatusRef = useRef(null);
  const gameIdRef = useRef(null);
  const isTimerRunRef = useRef(null);
  const timerTimeRef = useRef(null);
  const chosenCardsRef = useRef(null);
  const lastSentCardsRef = useRef('');
  const countOfAnswersRef = useRef(null);
  // новые refs для актуальных значений сокета
  const sendRef = useRef(send);
  const isOnlineRef = useRef(isOnline);
  const pendingPayloadRef = useRef(null);

  const gamePhase = useSelector(selectGamePhase);
  const gameStatus = useSelector(selectGameStatus);
  const gameId = useSelector(selectGameId);
  const isTimerRun = useSelector(getIsTimerRun);
  const timerTime = useSelector(getTimerTime);
  const chosenCards = useSelector(selectChosenCardsStable);
  const countOfAnswers = useSelector(getCountOfAnswers);

  useEffect(() => {
    sendRef.current = send;
  }, [send]);
  useEffect(() => {
    isOnlineRef.current = isOnline;
    if (isOnline && pendingPayloadRef.current) {
      sendRef.current(pendingPayloadRef.current);
      pendingPayloadRef.current = null;
    }
  }, [isOnline]);

  useEffect(() => {
    gamePhaseRef.current = gamePhase;
    gameStatusRef.current = gameStatus;
    gameIdRef.current = gameId;
    isTimerRunRef.current = isTimerRun;
    timerTimeRef.current = timerTime;
    chosenCardsRef.current = chosenCards;
    countOfAnswersRef.current = countOfAnswers;
  }, [
    gamePhase,
    gameStatus,
    gameId,
    isTimerRun,
    timerTime,
    chosenCards,
    countOfAnswers,
  ]);

  useEffect(() => {
    if (
      isTimerRunRef.current &&
      timerTimeRef.current >= 0 &&
      gamePhaseRef.current !== 'end_phase_master_choice'
    ) {
      // -0.4 c округлением до 0.1, без toFixed-строк
      const next = Math.max(
        0,
        Math.round((timerTimeRef.current - 0.4) * 10) / 10,
      );
      dispatch(setTimerTime(next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../components/helpers/timerWorker.js', import.meta.url),
    );
    if (workerRef.current) {
      workerRef.current.onmessage = () => {
        const current = JSON.stringify(chosenCardsRef.current); // текущий выбор
        const phase = gamePhaseRef.current;
        const isPlaying =
          phase === 'playing' || phase === 'all_selected_player_card';
        const newCardChoice =
          chosenCardsRef.current.length > 0 &&
          current !== lastSentCardsRef.current; // если карточки выбраны и текущий выбор отличается от предыдущего
        if (
          isTimerRunRef.current &&
          isPlaying &&
          (newCardChoice || timerTimeRef.current === 0)
        ) {
          if (
            chosenCardsRef.current.length === countOfAnswersRef.current ||
            timerTimeRef.current === 0
          ) {
            const payload = {
              command: 'check_choice_player_card',
              selected_cards: chosenCardsRef.current.map((cardId, index) => ({
                card_id: Number(cardId),
                order: index + 1,
              })),
              game_id: Number(gameIdRef.current),
            };
            if (isOnlineRef.current) {
              sendRef.current(payload);
            } else {
              // сокет ещё не открыт — отправим сразу после реконнекта
              pendingPayloadRef.current = payload;
            }
          }
          /* сохраняем текущее состояние выбранных карточек,
          чтобы избежать повторной отправки одного и того же выбора */
          lastSentCardsRef.current = current;
          workerRef.current &&
            workerRef.current.postMessage({ action: 'stop' });
        }

        if (
          isTimerRunRef.current &&
          timerTimeRef.current >= 0 &&
          gamePhaseRef.current !== 'end_phase_master_choice'
        ) {
          // -0.2 c округлением до 0.1
          const next = Math.max(
            0,
            Math.round((timerTimeRef.current - 0.2) * 10) / 10,
          );
          dispatch(setTimerTime(next));
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WorkerContext.Provider value={workerRef.current}>
      {children}
    </WorkerContext.Provider>
  );
};
