// src/entities/game/model/ws.gameHffHandlers.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { wsManager } from '@/websocket/WsManager';
import type { AppDispatch } from '@/store/store';
import {
  setGameId,
  setNewRound,
  setGameStatus,
  setGamePhase,
  setEndGameTime,
  setEndGamePlayers,
  upsertSubmission,
  setSelectionCounter,
  setPromptCard,
  setMasterId,
  setRoundWinner,
  setShowSelectedCards,
  setSelectedCardId,
  resetGame,
  setIsTimerRun,
  setGameStartTime,
  setResumed,
  setPaused,
} from '@/store/fuflomicin/fuflSlice';
import { updatePlayerHandFromRound } from '@/store/fuflomicin/fuflThunks';
import {
  setGameMeta,
  upsertMany as gameUpsertMany,
  selectAllGamePlayers,
} from '@/entities/player/model/gamePlayerSlice';
import { GAME_PHASES, GAME_STATUS } from '@/fuflomicin/constants';
import { createGameCommonHandlers } from './ws.gameCommonHandlers';
import { logEventReceived, recordMetric } from '@/websocket/utils/wsLogger';
import { closeModal } from '@/store/modalSlice';

export type Ctx = {
  dispatch: AppDispatch;
  getState: () => any;
  ws: typeof wsManager;
};

// TM: карточка раунда — одна question-карточка (card.question.name)
const handleStartRound = ({ dispatch, getState }: Ctx, m: any) => {
  logEventReceived('start_round', JSON.stringify(m).length);
  recordMetric('replaceAll');

  if (Array.isArray(m?.players)) {
    dispatch(gameUpsertMany(m.players));
    dispatch(updatePlayerHandFromRound(m.players) as any);
  }

  const question = m?.card?.question ?? m?.card ?? {};
  const promptText = question.name ?? question.text ?? '';

  dispatch(
    setPromptCard({
      adjective: '',
      noun: '',
      text: promptText,
    }),
  );

  dispatch(
    setNewRound({
      id: Number(m.current_round ?? 1),
      roundNumber: Number(m.current_round ?? 1),
      text: promptText,
      cardType: 'prompt',
      timerTime: m?.settings?.player_round_second ?? 60,
    }),
  );

  const rawMasterId =
    m?.master_id ??
    m?.master_player_id ??
    m?.master ??
    m?.masterUserId ??
    m?.master_user_id;

  if (rawMasterId != null) {
    dispatch(setMasterId(Number(rawMasterId)));
  }

  dispatch(setGamePhase(GAME_PHASES.PLAYER_SUBMISSION));
  dispatch(setGameStatus(GAME_STATUS.RUNNING));
  dispatch(setIsTimerRun(true));
};

const handleCardSelection = ({ dispatch, getState }: Ctx, m: any) => {
  logEventReceived('card_selection', JSON.stringify(m).length);
  recordMetric('replaceAll');

  if (m?.player_select) {
    let playerId: number | null = null;
    let phrase = '';
    let cardId = 0;

    const keys = Object.keys(m.player_select);
    const isMapFormat = keys.some(k => !isNaN(Number(k)));

    if (isMapFormat) {
      const firstKey = keys.find(k => !isNaN(Number(k)));
      if (firstKey) {
        playerId = Number(firstKey);
        phrase = String(m.player_select[firstKey]);
      }
    } else {
      playerId = Number(m.player_select.player_id ?? m.player_select.user_id);
      phrase = String(m.player_select.phrase ?? '');
      cardId = Number(m.player_select.card_id ?? 0);
    }

    if (playerId && !isNaN(playerId)) {
      dispatch(
        upsertSubmission({
          playerId,
          submission: { card_id: cardId, phrase },
        }),
      );
    }
  }

  if (m?.counter != null) {
    dispatch(setSelectionCounter(Number(m.counter)));
  }
};

const handleEndPhaseMasterChoice = ({ dispatch, getState }: Ctx, m: any) => {
  logEventReceived('end_phase_master_choice', JSON.stringify(m).length);
  recordMetric('replaceAll');

  if (m?.winner != null) {
    const w = m.winner;
    const normalized =
      typeof w === 'object' && w !== null
        ? {
            id: Number(w.id),
            text: String(w.text ?? w.name ?? ''),
            is_censorship: !!w.is_censorship,
            type: w.type ?? 'ANSWER',
            answer_count_card: w.answer_count_card ?? null,
            audio: w.audio ?? null,
            player_id: w.player_id,
            player_name: w.player_name,
          }
        : {
            id: Number(w),
            text: '',
            is_censorship: false,
            type: 'ANSWER',
            answer_count_card: null,
            audio: null,
            player_id: undefined,
            player_name: undefined,
          };

    if (Number.isFinite(normalized.id)) {
      dispatch(setRoundWinner(normalized));
    }
  }
  dispatch(setGamePhase(GAME_PHASES.REVEAL_MASTER_SELECTION));
};

const handleFinishGame = ({ dispatch, getState }: Ctx, m: any) => {
  logEventReceived('finish_game', JSON.stringify(m).length);
  recordMetric('replaceAll');

  dispatch(closeModal('modalWaitingForPlayers'));

  sessionStorage.removeItem('currentGameId');
  sessionStorage.removeItem('currentGameType');
  sessionStorage.setItem('gameFinished', 'true');
  const lobbyId = getState()?.currentLobby?.lobby?.id;
  if (lobbyId != null) {
    sessionStorage.setItem('finishedLobbyId', String(lobbyId));
  }

  const users = Array.isArray(m?.users) ? m.users : [];
  const endGamePlayers = users.map((u: any) => ({
    userId: Number(u.user_id ?? u.id),
    username: String(u.name ?? u.username ?? ''),
    points: Number(u.points ?? 0),
  }));

  dispatch(setEndGamePlayers(endGamePlayers));

  // Победный раунд не завершается start_round, поэтому финальные очки
  // приходят только здесь — синхронизируем их в список игроков.
  // Сопоставляем по id игрока: у ботов user_id = null.
  const finalPointsByPlayerId = new Map<number, number>(
    users
      .filter((u: any) => u?.id != null)
      .map((u: any) => [Number(u.id), Number(u.points ?? 0)]),
  );
  const updatedPlayers = selectAllGamePlayers(getState())
    .filter(p => finalPointsByPlayerId.has(Number(p.id)))
    .map(p => ({
      ...p,
      points: finalPointsByPlayerId.get(Number(p.id)) as number,
    }));
  if (updatedPlayers.length > 0) {
    dispatch(gameUpsertMany(updatedPlayers));
  }

  dispatch(setEndGameTime(m.timestamp ?? Date.now()));
  dispatch(setGamePhase(GAME_PHASES.FINISH_GAME));
};

const gameHffHandlers = {
  ...createGameCommonHandlers({
    resetGameState: resetGame as any,
    onPause: () => setPaused(),
    onResume: () => setResumed(),
  }),

  /** start_game - HFF инициализация */
  start_game({ dispatch }: Ctx, m: any) {
    logEventReceived('start_game', JSON.stringify(m).length);
    recordMetric('replaceAll');

    if (m?.game_id != null) {
      const gameId = Number(m.game_id);
      dispatch(setGameMeta({ gameType: 'hff', gameId }));
      dispatch(setGameId(gameId));
      dispatch(setGamePhase(GAME_PHASES.WAITING));
      dispatch(setGameStatus(GAME_STATUS.RUNNING));
      dispatch(setGameStartTime(m.timestamp ?? new Date().toISOString()));

      sessionStorage.setItem('currentGameId', String(m.game_id));
      sessionStorage.setItem('currentGameType', 'hff');
    }
  },

  start_phase_player_choice_card({ dispatch }: Ctx, m: any) {
    logEventReceived(
      'start_phase_player_choice_card',
      JSON.stringify(m).length,
    );
    recordMetric('replaceAll');
    dispatch(setGameStatus(GAME_STATUS.RUNNING));
    dispatch(setGamePhase(GAME_PHASES.PLAYER_SUBMISSION));
  },

  start_round: handleStartRound,
  start_round_tm: handleStartRound,

  end_phase_player_choice_card({ dispatch }: Ctx, m: any) {
    logEventReceived('end_phase_player_choice_card', JSON.stringify(m).length);
    recordMetric('replaceAll');
    dispatch(setIsTimerRun(false));
    dispatch(setGamePhase(GAME_PHASES.END_PLAYER_SUBMISSION));
  },

  show_selected_cards({ dispatch }: Ctx, m: any) {
    logEventReceived('show_selected_cards', JSON.stringify(m).length);
    recordMetric('replaceAll');

    if (m.cards) {
      dispatch(setShowSelectedCards(m.cards));
      Object.entries(m.cards).forEach(([userId, phrase]) => {
        dispatch(
          upsertSubmission({
            playerId: Number(userId),
            submission: { card_id: 0, phrase: String(phrase) },
          }),
        );
      });
    }
    dispatch(setGamePhase(GAME_PHASES.REVEAL_SUBMISSIONS));
  },

  start_phase_master_choice({ dispatch }: Ctx, m: any) {
    logEventReceived('start_phase_master_choice', JSON.stringify(m).length);
    recordMetric('replaceAll');
    dispatch(setGamePhase(GAME_PHASES.REVEAL_SUBMISSIONS));
  },

  master_selected_cards({ dispatch }: Ctx, m: any) {
    logEventReceived('master_selected_cards', JSON.stringify(m).length);
    recordMetric('replaceAll');

    const winnerIdFromFields = Number(
      m?.player_id ??
        m?.playerId ??
        m?.user_id ??
        m?.userId ??
        m?.winner_id ??
        m?.winnerId,
    );
    if (Number.isFinite(winnerIdFromFields)) {
      dispatch(setSelectedCardId(winnerIdFromFields));
      return;
    }

    if (m?.cards && typeof m.cards === 'object') {
      const keys = Object.keys(m.cards);
      if (keys.length === 1) {
        const winnerIdFromCards = Number(keys[0]);
        if (Number.isFinite(winnerIdFromCards)) {
          dispatch(setSelectedCardId(winnerIdFromCards));
        }
      }
    }
  },

  card_selection: handleCardSelection,
  card_selection_tm: handleCardSelection,

  end_phase_master_choice: handleEndPhaseMasterChoice,
  end_phase_master_choice_tm: handleEndPhaseMasterChoice,

  finish_game: handleFinishGame,
  finish_game_tm: handleFinishGame,
} as const;

export function registerGameHffHandlers() {
  wsManager.registerGroup('game:hff', gameHffHandlers);
}
