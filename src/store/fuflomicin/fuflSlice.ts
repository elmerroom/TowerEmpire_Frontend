import { createSlice } from '@reduxjs/toolkit';
import type {
  Player,
  PlayersMap,
  AnswerCardWire,
  RoundState,
  Word,
  Preposition,
} from '@/fuflomicin/types';
import {
  GamePhase,
  GameStatus,
  GAME_PHASES,
  GAME_STATUS,
} from '@/fuflomicin/constants';

export interface PromptCard {
  adjective: string;
  noun: string;
  text: string;
}

export interface Submission {
  card_id: number;
  phrase: string;
}

export interface GameState {
  gameId: number | null;
  gameName: string;
  status: GameStatus;
  endTimestamp: string | null;
  pauseTimestamp: string | null;
  resumeTimestamp: string | null;
  gamePhase: GamePhase;
  previousPhase: GamePhase | null;
  isTimerRun: boolean;
  roundWinner: AnswerCardWire | null;
  startRoundTime: number | null;
  gameStartTime: string | null;
  endGameTime: number | null;
  endGamePlayers: Player[];
  currentRound: RoundState;
  finalSentenceToSubmit: string;
  wordsCurrentPlayer: Word[];
  prepositions: Preposition[];
  wordLimit: number | null;
  players: PlayersMap;
  rounds: RoundState[];
  // WS additions
  promptCard: PromptCard | null;
  // что отправили игроки
  submissions: Record<number, Submission>;
  // что показано мастеру (reveal)
  showSelectedCards: Record<number, string>;
  selectionCounter: number;
  handCards: Word[];
  // победитель
  selectedCardId: number | null;
  masterId: number | null;
}

const initialState: GameState = {
  gameId: null,
  gameName: 'Fuflomicin',
  status: GAME_STATUS.IDLE,
  endTimestamp: null,
  pauseTimestamp: null,
  resumeTimestamp: null,
  gamePhase: GAME_PHASES.WAITING,
  previousPhase: null,
  isTimerRun: false,
  roundWinner: null,
  startRoundTime: null,
  gameStartTime: null,
  endGameTime: null,
  endGamePlayers: [],
  currentRound: {
    id: 1,
    roundNumber: null,
    text: '',
    cardType: '',
    timerTime: 15,
  },
  finalSentenceToSubmit: '',
  wordsCurrentPlayer: [],
  prepositions: [],
  wordLimit: 4,
  players: {},
  rounds: [],
  // WS additions
  promptCard: null,
  submissions: {},
  showSelectedCards: {},
  selectionCounter: 0,
  handCards: [],
  selectedCardId: null,
  masterId: null,
};

export const fuflSlice = createSlice({
  name: 'fuflGame',
  initialState,
  reducers: {
    setGameId(state, action) {
      state.gameId = action.payload;
    },
    setNewRound(state, action) {
      const { id, roundNumber, text, cardType, timerTime } = action.payload;

      state.submissions = {};
      state.showSelectedCards = {};
      state.selectionCounter = 0;
      state.selectedCardId = null;
      state.roundWinner = null;
      state.wordsCurrentPlayer = state.wordsCurrentPlayer.map((w, i) => ({
        ...w,
        field: 'WORDS',
        selectedIndex: 0,
        order: i,
      }));
      state.prepositions = state.prepositions.map((p, i) => ({
        ...p,
        field: 'PICKER',
        order: i,
      }));
      state.finalSentenceToSubmit = '';

      state.currentRound = {
        ...state.currentRound,
        id,
        roundNumber,
        text,
        cardType,
        timerTime,
      };

      state.rounds.push({ id, roundNumber, text, cardType });
    },
    setPlayers(state, action) {
      state.players = action.payload;
    },
    setGameStatus(state, action) {
      state.status = action.payload;
    },
    setGamePhase(state, action) {
      state.gamePhase = action.payload;
    },
    setPreviousPhase(state, action) {
      state.previousPhase = action.payload;
    },
    setPaused(state) {
      if (state.status === 'paused') return;
      state.status = 'paused';
      state.isTimerRun = false;
      state.pauseTimestamp = new Date().toISOString();
    },
    setResumed(state) {
      if (state.status === 'running') return;
      state.status = 'running';
      state.isTimerRun = true;
      state.resumeTimestamp = new Date().toISOString();
    },
    resetGame: () => initialState,
    setIsTimerRun(state, action) {
      state.isTimerRun = action.payload;
    },
    setRoundWinner(state, action) {
      state.roundWinner = action.payload;
    },
    setStartRoundTime(state, action) {
      state.startRoundTime = action.payload;
    },
    setGameStartTime(state, action) {
      state.gameStartTime = action.payload;
    },
    setEndGameTime(state, action) {
      state.endGameTime = action.payload;
    },
    setEndGamePlayers(state, action) {
      state.endGamePlayers = action.payload;
    },
    resetSentence(state) {
      // Возвращаем все слова в поле WORDS
      state.wordsCurrentPlayer = state.wordsCurrentPlayer.map((w, i) => ({
        ...w,
        field: 'WORDS',
        selectedIndex: 0,
        order: i, // Восстанавливаем исходный порядок
      }));

      // Возвращаем все предлоги в поле PICKER
      state.prepositions = state.prepositions.map((p, i) => ({
        ...p,
        field: 'PICKER',
        order: i,
      }));

      state.finalSentenceToSubmit = '';
    },
    setFinalSentenceToSubmit(state, action) {
      state.finalSentenceToSubmit = action.payload;
    },
    setWordVariant(state, action) {
      const word = state.wordsCurrentPlayer.find(
        w => w.id === action.payload.wordId,
      );

      if (word) {
        word.selectedIndex = action.payload.selectedIndex;
      }
    },

    reorderItemsInSentence(state, action) {
      const { finalOrder } = action.payload; // array of IDs

      // проходимся по всем id в новом порядке
      finalOrder.forEach((id: any, index: any) => {
        const word = state.wordsCurrentPlayer.find(w => w.id === id);
        const prep = state.prepositions.find(p => p.id === id);

        // свойство 'order' в соответствии с его новым индексом в списке
        if (word) word.order = index;
        if (prep) prep.order = index;
      });
    },
    moveItemToSentenceField(state, action) {
      const { id, type, targetField } = action.payload;

      const item =
        type === 'WORD'
          ? state.wordsCurrentPlayer.find(w => w.id === id)
          : state.prepositions.find(p => p.id === id);

      if (item) {
        item.field = targetField;

        const sameFieldItems = [
          ...state.wordsCurrentPlayer.filter(w => w.field === targetField),
          ...state.prepositions.filter(p => p.field === targetField),
        ];
        item.order = sameFieldItems.length;
      }
    },
    setWordsCurrentPlayer(state, action) {
      state.wordsCurrentPlayer = action.payload;
    },
    // WS actions
    setPromptCard(state, action) {
      state.promptCard = action.payload;
    },
    setHandCards(state, action) {
      state.handCards = action.payload;
    },
    setSelectedCardId(state, action) {
      state.selectedCardId = action.payload;
    },
    upsertSubmission(state, action) {
      const { playerId, submission } = action.payload;
      state.submissions[playerId] = submission;
    },
    setShowSelectedCards(state, action) {
      state.showSelectedCards = action.payload;
    },
    setSelectionCounter(state, action) {
      state.selectionCounter = action.payload;
    },
    setMasterId(state, action) {
      state.masterId = action.payload;
      Object.keys(state.players).forEach(id => {
        const playerId = Number(id);
        const player = state.players[playerId];
        if (!player) return;
        player.isMaster = playerId === action.payload;
      });
    },
    setPrepositionsFromServer(state, action) {
      const list = action.payload as { id: number; name: string }[];
      state.prepositions = list.map((p, i) => ({
        id: String(p.id),
        text: p.name,
        type: 'PREPOSITION' as const,
        field: 'PICKER' as const,
        order: i,
      }));
    },
    setWordLimit(state, action) {
      state.wordLimit = action.payload;
    },
    setCurrentRoundTimerTime(state, action) {
      state.currentRound.timerTime = action.payload;
    },
  },
  selectors: {
    getGameId: state => state.gameId,
    getGameName: state => state.gameName,
    getPlayers: state => state.players,
    getGameStatus: state => state.status,
    getGamePhase: state => state.gamePhase,
    getIsTimerRun: state => state.isTimerRun,
    getRoundWinner: state => state.roundWinner,
    getStartRoundTime: state => state.startRoundTime,
    getFinalSentenceToSubmit: state => state.finalSentenceToSubmit,
    getWordsCurrentPlayer: state => state.wordsCurrentPlayer,
    getWordLimit: state => state.wordLimit,
    getPrepositions: state => state.prepositions,
    getGameStartTime: state => state.gameStartTime,
    getEndGameTime: state => state.endGameTime,
    getEndGamePlayers: state => state.endGamePlayers,
    getSubmissions: state => state.submissions,
    getShowSelectedCards: state => state.showSelectedCards,
    getMasterId: state => state.masterId,
    getPromptCard: state => state.promptCard,
    getSelectedCardId: state => state.selectedCardId,
  },
});

export const {
  setGameId,
  setNewRound,
  setPlayers,
  setGameStatus,
  setGamePhase,
  setPreviousPhase,
  setPaused,
  setResumed,
  resetGame,
  setIsTimerRun,
  setRoundWinner,
  setStartRoundTime,
  setGameStartTime,
  setEndGameTime,
  setEndGamePlayers,
  resetSentence,
  setFinalSentenceToSubmit,
  setWordVariant,
  reorderItemsInSentence,
  moveItemToSentenceField,
  setWordsCurrentPlayer,
  // WS actions
  setPromptCard,
  setHandCards,
  setSelectedCardId,
  upsertSubmission,
  setShowSelectedCards,
  setSelectionCounter,
  setMasterId,
  setPrepositionsFromServer,
  setWordLimit,
  setCurrentRoundTimerTime,
} = fuflSlice.actions;

export const {
  getGameId,
  getGameName,
  getPlayers,
  getGameStatus,
  getGamePhase,
  getIsTimerRun,
  getRoundWinner,
  getStartRoundTime,
  getGameStartTime,
  getEndGameTime,
  getEndGamePlayers,
  getFinalSentenceToSubmit,
  getWordsCurrentPlayer,
  getPrepositions,
  getWordLimit,
  getSubmissions,
  getShowSelectedCards,
  getMasterId,
  getPromptCard,
  getSelectedCardId,
} = fuflSlice.selectors;

export default fuflSlice.reducer;
