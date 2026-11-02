import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPhase,
  selectGameStatus,
} from '../../../entities/game/model/gameBjSlice';
import { playAnimation } from '../model/animateSlice';
import { useGameTimer } from '../../../entities/game/model/GameTimerContext';

const TIMER_PHASES = new Set([
  'player_choice',
  'master_choice',
  'all_selected_player_card',
  'show_selected_cards',
]);

const PHASE_ANIMATION_MAP = {
  player_choice: { key: 'choose', withFlash: true },
  master_choice: { key: 'choose', withFlash: true },
  all_selected_player_card: { key: 'choose', withFlash: true },
  show_selected_cards: { key: 'choose', withFlash: true },
  intermission: { key: 'master', withFlash: true },
  finish_game: { key: 'final', withFlash: false },
};

export const CatTimerWatcher = () => {
  const dispatch = useDispatch();
  const gamePhase = useSelector(selectPhase);
  const { timeLeft } = useGameTimer();
  const currentSeconds = Math.ceil(timeLeft - 0.2);
  const prevSeconds = useRef(currentSeconds);

  useEffect(() => {
    if (prevSeconds.current !== currentSeconds) {
      if (currentSeconds === 6 && TIMER_PHASES.has(gamePhase)) {
        dispatch(playAnimation({ key: 'timer', withFlash: true }));
      }
      prevSeconds.current = currentSeconds;
    }
  }, [currentSeconds, gamePhase, dispatch]);

  return null;
};

export const CatAnimationController = () => {
  const dispatch = useDispatch();
  const gamePhase = useSelector(selectPhase);
  const gameStatus = useSelector(selectGameStatus);

  const prevPhase = useRef(null);
  const prevStatus = useRef(gameStatus);

  useEffect(() => {
    const phaseChanged = prevPhase.current !== gamePhase;
    const statusChanged = prevStatus.current !== gameStatus;

    if (phaseChanged) {
      const anim = PHASE_ANIMATION_MAP[gamePhase];
      if (anim) dispatch(playAnimation(anim));
      else dispatch(playAnimation({ key: 'master', withFlash: true }));
      prevPhase.current = gamePhase;
    }

    if (statusChanged) {
      if (gameStatus === 'paused' && TIMER_PHASES.has(gamePhase)) {
        dispatch(playAnimation({ key: 'sleep', withFlash: true }));
      }
      if (gameStatus === 'running') {
        const anim = PHASE_ANIMATION_MAP[gamePhase];
        if (anim) dispatch(playAnimation(anim));
      }
      prevStatus.current = gameStatus;
    }
  }, [gamePhase, gameStatus, dispatch]);

  return null;
};
