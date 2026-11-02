import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { useTimer, useCountdownSound } from '../../../components/helpers/hooks';
import type { RootState } from '@/store/store';
import {
  selectChosenCardsCurrentPlayer,
  selectCountOfAnswers,
  selectGameId,
  selectTimerTime,
  selectIsTimerRun,
  selectPhase,
  selectCurrentRound,
} from './gameBjSlice';
import {
  getRoundTime,
  getMasterTime,
} from '../../../features/gameSettings/model/gameSettingsSlice';
import { useWebSocket } from '@/store/contexts/WsRootProvider';
import {
  logRender,
  logTimer,
  logTimerInfluence,
} from '../../../websocket/utils/wsLogger';

interface GameTimerContextType {
  timeLeft: number;
  progress: number;
  maxTime: number;
  isPaused: boolean;
}

const GameTimerContext = createContext<GameTimerContextType | null>(null);

export const GameTimerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { send, isOnline } = useWebSocket();
  const isTimerRun = useSelector((state: RootState) => selectIsTimerRun(state));
  const reduxTimerTime = useSelector((state: RootState) =>
    selectTimerTime(state),
  );
  const gamePhase = useSelector((state: RootState) => selectPhase(state));
  const currentRoundId = useSelector((state: RootState) =>
    selectCurrentRound(state),
  ); // To detect new round
  const gameId = useSelector((state: RootState) => selectGameId(state));
  const chosenCards = useSelector((state: RootState) =>
    selectChosenCardsCurrentPlayer(state),
  );
  const countOfAnswers = useSelector((state: RootState) =>
    selectCountOfAnswers(state),
  );

  // Max time depends on phase
  const roundTime = useSelector(getRoundTime) || 30;
  const masterTime = useSelector(getMasterTime) || 30;
  const maxTime = gamePhase === 'master_choice' ? masterTime : roundTime;

  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  logRender('GameTimerProvider', renderCountRef.current, {
    isTimerRun,
    reduxTimerTime,
    gamePhase,
    currentRoundId,
    maxTime,
  });

  // We use a ref to track if we have initialized the timer for this round/phase
  const lastSyncedRoundRef = useRef<any>(null);
  const lastSyncedPhaseRef = useRef<string | null>(null);
  const lastSyncedTimerTimeRef = useRef<number | null>(null);
  const lastInputsRef = useRef<{
    isTimerRun: boolean;
    reduxTimerTime: number;
    gamePhase: string | null;
    currentRoundId: number | null;
    maxTime: number;
  } | null>(null);

  const sendRef = useRef(send);
  const isOnlineRef = useRef(isOnline);
  const pendingPayloadRef = useRef<any>(null);
  const lastAutoSubmitKeyRef = useRef<string>('');

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

  // useTimer hook
  // We initialize with reduxTimerTime, but we control it manually mostly.
  const { count, start, pause, resume, restart, active } = useTimer(
    Math.ceil(reduxTimerTime || 0),
    {
      immediately: false, // We control start via effect
      onTick: (s: number) => {
        // Optional: Log every N seconds or just specific events to avoid spam
        if (s % 5 === 0) logTimer('tick', s, 'running');
      },
      onExpire: () => {
        logTimer('expire', 0, 'finished');
        logTimerInfluence('expire', {
          gamePhase,
          currentRoundId,
          chosenCardsCount: chosenCards.length,
          countOfAnswers,
          gameId,
          isOnline: isOnlineRef.current,
        });

        if (gamePhase !== 'player_choice') return;
        if (!countOfAnswers) return;

        if (chosenCards.length === countOfAnswers && isOnlineRef.current)
          return;

        const payload: any = {
          command: 'check_choice_player_card',
          selected_cards: chosenCards.map((cardId, index) => ({
            card_id: Number(cardId),
            order: index + 1,
          })),
        };
        if (gameId != null) {
          payload.game_id = Number(gameId);
        }

        const key = `${currentRoundId ?? 'null'}|${gamePhase ?? 'null'}|${chosenCards.join(',')}`;
        if (lastAutoSubmitKeyRef.current === key) return;

        if (isOnlineRef.current) {
          sendRef.current(payload);
        } else {
          pendingPayloadRef.current = payload;
        }
        lastAutoSubmitKeyRef.current = key;
      },
    },
  );

  useEffect(() => {
    const prev = lastInputsRef.current;
    const next = {
      isTimerRun,
      reduxTimerTime: Number(reduxTimerTime || 0),
      gamePhase: gamePhase ?? null,
      currentRoundId: currentRoundId ?? null,
      maxTime: Number(maxTime || 0),
    };
    if (
      !prev ||
      prev.isTimerRun !== next.isTimerRun ||
      prev.reduxTimerTime !== next.reduxTimerTime ||
      prev.gamePhase !== next.gamePhase ||
      prev.currentRoundId !== next.currentRoundId ||
      prev.maxTime !== next.maxTime
    ) {
      logTimerInfluence('inputs_changed', { prev, next });
      lastInputsRef.current = next;
    }
  }, [isTimerRun, reduxTimerTime, gamePhase, currentRoundId, maxTime]);

  // Sync Effect: Handle Start/Pause/Resume and New Round
  useEffect(() => {
    const isNewRound = currentRoundId !== lastSyncedRoundRef.current;
    const isNewPhase = gamePhase !== lastSyncedPhaseRef.current;
    const isNewTimerTime = reduxTimerTime !== lastSyncedTimerTimeRef.current;

    // Check if we need to RESTART the timer (new round or phase)
    if (isNewRound || isNewPhase || isNewTimerTime) {
      logTimer('sync_reset', reduxTimerTime, isTimerRun ? 'running' : 'paused');
      logTimerInfluence('sync_reset', {
        isNewRound,
        isNewPhase,
        isNewTimerTime,
        reduxTimerTime,
        isTimerRun,
        currentRoundId,
        gamePhase,
        active,
        count,
      });
      restart(Math.ceil(reduxTimerTime || 0), isTimerRun ?? false);
      lastSyncedRoundRef.current = currentRoundId;
      lastSyncedPhaseRef.current = gamePhase;
      lastSyncedTimerTimeRef.current = reduxTimerTime;
      return;
    }

    // Check Pause/Resume state
    if (isTimerRun && !active && count > 0) {
      logTimer('sync_resume', count, 'running');
      logTimerInfluence('sync_resume', { count, active, isTimerRun });
      resume();
    } else if (!isTimerRun && active) {
      logTimer('sync_pause', count, 'paused');
      logTimerInfluence('sync_pause', { count, active, isTimerRun });
      pause();
    }
  }, [
    isTimerRun,
    reduxTimerTime,
    currentRoundId,
    gamePhase,
    active,
    count,
    restart,
    resume,
    pause,
  ]);

  // If reduxTimerTime changes drastically (e.g. server correction), we might want to sync?
  // But avoiding "tick" updates from Redux is key.
  // We assume reduxTimerTime is "initial" time for the round, or updated only on significant events.

  const value = useMemo(
    () => ({
      timeLeft: count,
      progress: maxTime > 0 ? (count / maxTime) * 100 : 0,
      maxTime,
      isPaused: !isTimerRun, // or !active
    }),
    [count, maxTime, isTimerRun, active],
  );

  useCountdownSound({
    count,
    isActive: active && isTimerRun,
    phase: gamePhase,
    phases: ['player_choice', 'master_choice'],
    soundUrl: '/sounds/timer-tik.mp3',
    roundId: currentRoundId,
  });

  return (
    <GameTimerContext.Provider value={value}>
      {children}
    </GameTimerContext.Provider>
  );
};

export const useGameTimer = () => {
  const context = useContext(GameTimerContext);
  if (!context) {
    throw new Error('useGameTimer must be used within GameTimerProvider');
  }
  return context;
};
