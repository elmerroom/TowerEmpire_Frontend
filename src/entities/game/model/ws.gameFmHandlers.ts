// src/entities/game-fm/model/ws.gameFmHandlers.ts
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
  setWordsCurrentPlayer,
  setIsTimerRun,
  setGameStartTime,
  setPrepositionsFromServer,
  setResumed,
  setPaused,
  setCurrentRoundTimerTime,
} from '@/store/fuflomicin/fuflSlice';
import { updatePlayerHandFromRound } from '@/store/fuflomicin/fuflThunks';
import {
  setGameMeta,
  upsertMany as gameUpsertMany,
  selectAllGamePlayers,
} from '@/entities/player/model/gamePlayerSlice';
import { GAME_PHASES, GAME_STATUS } from '@/fuflomicin/constants';
import { createGameCommonHandlers } from './ws.gameCommonHandlers';

// Smart update logging
import { logEventReceived, recordMetric } from '@/websocket/utils/wsLogger';
import { closeModal } from '@/store/modalSlice';

/** Handler context the WsManager passes into each handler */
export type Ctx = {
  dispatch: AppDispatch;
  getState: () => any;
  ws: typeof wsManager;
};

const handleStartRound = ({ dispatch, getState }: Ctx, m: any) => {
  logEventReceived('start_round', JSON.stringify(m).length);
  recordMetric('replaceAll');

  if (Array.isArray(m?.players)) {
    dispatch(gameUpsertMany(m.players));
    dispatch(updatePlayerHandFromRound(m.players) as any);
  }

  const card = m?.card ?? {};
  const gender = card.noun?.gender ?? 'М';
  const adjectiveText =
    gender === 'Ж'
      ? (card.adjective?.female ?? card.adjective?.male ?? '')
      : (card.adjective?.male ?? card.adjective?.female ?? '');
  const nounText = card.noun?.nuon ?? '';
  const promptText =
    adjectiveText && nounText
      ? `${adjectiveText} ${nounText}`
      : (card.text ?? '');

  dispatch(
    setPromptCard({
      adjective: adjectiveText,
      noun: nounText,
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
          submission: {
            card_id: cardId,
            phrase,
          },
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

    let normalized;

    if (typeof w === 'object' && w !== null) {
      normalized = {
        id: Number(w.id),
        text: String(w.text ?? ''),
        is_censorship: !!w.is_censorship,
        type: w.type ?? 'ANSWER',
        answer_count_card: w.answer_count_card ?? null,
        audio: w.audio ?? null,
        player_id: w.player_id,
        player_name: w.player_name,
      };
    } else {
      normalized = {
        id: Number(w),
        text: '', // temp empty
        is_censorship: false,
        type: 'ANSWER',
        answer_count_card: null,
        audio: null,
        player_id: undefined,
        player_name: undefined,
      };
    }

    if (Number.isFinite(normalized.id)) {
      //   dispatch(setSelectedCardId(winnerId));
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

// ─────────────────────────────────────────────────────────────────────────────
// Game FM handlers - ONLY FM-specific handlers
// Common handlers (user_leave, user_kick, exit_all_from_game, pause_game,
// resume_game, settings, etc.) are handled by game:bj group which is also active
// ─────────────────────────────────────────────────────────────────────────────

const gameFmHandlers = {
  ...createGameCommonHandlers({
    resetGameState: resetGame as any,
    onPause: () => setPaused(),
    onResume: () => setResumed(),
  }),

  /** new_cards - Receive player's hand cards */
  new_cards({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('new_cards', JSON.stringify(m).length);
    recordMetric('replaceAll');

    const cards = m.cards || [];
    const normalizedCards = cards.map((c: any) => ({
      ...c,
      selectedIndex: c.selectedIndex ?? 0,
      field: 'WORDS', // Force field to WORDS so they appear in the hand
      type: c.type ?? 'WORD',
    }));

    dispatch(setWordsCurrentPlayer(normalizedCards));
  },

  /** start_game - FM-specific initialization */
  start_game({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('start_game', JSON.stringify(m).length);
    recordMetric('replaceAll');

    if (m?.game_id != null) {
      const gameId = Number(m.game_id);
      dispatch(setGameMeta({ gameType: 'fuf', gameId }));
      dispatch(setGameId(gameId));
      dispatch(setGamePhase(GAME_PHASES.WAITING));
      dispatch(setGameStatus(GAME_STATUS.RUNNING));
      dispatch(setGameStartTime(m.timestamp ?? new Date().toISOString()));

      // Сохраняем в sessionStorage для reconnect
      sessionStorage.setItem('currentGameId', String(m.game_id));
      sessionStorage.setItem('currentGameType', 'fm');
    }
  },

  // ──────────────────────────────────────────────────────────

  /** start_phase_player_choice_card */
  start_phase_player_choice_card({ dispatch, getState }: Ctx, m: any) {
    logEventReceived(
      'start_phase_player_choice_card',
      JSON.stringify(m).length,
    );
    recordMetric('replaceAll');
    dispatch(setGameStatus(GAME_STATUS.RUNNING));
    dispatch(setGamePhase(GAME_PHASES.PLAYER_SUBMISSION));
  },

  start_round: handleStartRound,
  start_round_fm: handleStartRound,

  /** end_phase_player_choice_card */
  end_phase_player_choice_card({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('end_phase_player_choice_card', JSON.stringify(m).length);
    recordMetric('replaceAll');
    dispatch(setIsTimerRun(false));
    dispatch(setGamePhase(GAME_PHASES.END_PLAYER_SUBMISSION));
  },

  /** show_selected_cards (в FM может быть просто переходом фазы) */
  show_selected_cards({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('show_selected_cards', JSON.stringify(m).length);
    recordMetric('replaceAll');

    if (m.cards) {
      dispatch(setShowSelectedCards(m.cards));
      Object.entries(m.cards).forEach(([userId, phrase]) => {
        dispatch(
          upsertSubmission({
            playerId: Number(userId),
            submission: {
              card_id: 0, // ID карты может быть неизвестен, но есть фраза
              phrase: String(phrase),
            },
          }),
        );
      });
    }

    dispatch(setGamePhase(GAME_PHASES.REVEAL_SUBMISSIONS));
  },

  /** start_phase_master_choice */
  start_phase_master_choice({ dispatch, getState }: Ctx, m: any) {
    logEventReceived('start_phase_master_choice', JSON.stringify(m).length);
    recordMetric('replaceAll');
    if (m?.time_round) {
      dispatch(setCurrentRoundTimerTime(Number(m.time_round)));
    }
    dispatch(setGamePhase(GAME_PHASES.REVEAL_SUBMISSIONS));
    dispatch(setIsTimerRun(true));
  },

  /** master_selected_cards (информативное; оставляем noop) */
  master_selected_cards({ dispatch, getState }: Ctx, m: any) {
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
  card_selection_fm: handleCardSelection,

  end_phase_master_choice: handleEndPhaseMasterChoice,
  end_phase_master_choice_fm: handleEndPhaseMasterChoice,

  finish_game: handleFinishGame,
  finish_game_fm: handleFinishGame,

  /** send_prepositions_for_fm - Receive prepositions from server */
  send_prepositions_for_fm({ dispatch }: Ctx, m: any) {
    logEventReceived('send_prepositions_for_fm', JSON.stringify(m).length);
    recordMetric('replaceAll');

    const list = m?.prepositions_list;
    if (Array.isArray(list) && list.length > 0) {
      dispatch(setPrepositionsFromServer(list));
    }
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────────────────────

export function registerGameFmHandlers() {
  // Key matches lobby activation: wsManager.activateGroup(`game:${payload.gameType}`)
  wsManager.registerGroup('game:fm', gameFmHandlers);
}
