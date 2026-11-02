// src/entities/game-bj/model/gameBjSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  QuestionCardWire,
  PlayerWire,
  SelectedCardWire,
  AnswerCardWire,
  FinishGamePayload,
  AllSelectedPlayerCard,
} from './wire-types';
import { GameBjPhase } from './events';

// Константный пустой массив для предотвращения создания новых ссылок
const EMPTY_ARRAY: never[] = [];

export type GameStatus = 'idle' | 'running' | 'paused';

export interface GameBjState {
  gameId: number | null;
  gameName: string | null;
  status: GameStatus;
  startTimestamp: string | null; // для телеметрии/диагностики
  endTimestamp: string | null;
  pauseTimestamp: string | null;
  resumeTimestamp: string | null;
  currentRound: number | null;
  masterId: number | null;
  question: QuestionCardWire | null;
  /** «Рука» по игроку: playerId -> список card_id (достаточно для UI) */
  handsByPlayer: Record<number, number[]>;
  /** на будущее, если понадобится текст карт: playerId -> массив SelectedCardWire */
  handsDetailedByPlayer: Record<number, SelectedCardWire[]>;
  /** выбранные карты, присланные сервером в фазе выбора */
  selectionsByPlayer: Record<number, number[]>;

  /** локальный выбор текущего игрока (до отправки на сервер) */
  chosenCardsCurrentPlayer: number[];
  /** все выбранные карты всех игроков для отображения мастеру */
  chosenCardsAllPlayers: Array<{
    playerId: number;
    card_id: number;
    cards: Array<{ id?: number; card_id: number; text: string }>;
    text: string;
  }>;
  /** количество ответов, которые нужно выбрать */
  countOfAnswers: number;

  /** победившая карта раунда */
  roundWinner: AnswerCardWire | null;
  gameWinner: PlayerWire | null;

  /** подсказки/сообщения ведущего */
  commentatorText: string | null;
  finalPlayers: PlayerWire[];
  gameWinnerId: number | null;

  /** ID карты, выбранной ведущим (для визуального выделения) */
  masterSelectedCardId: number | null;

  phase: GameBjPhase;
  timerTime: number;
}

const initialState: GameBjState = {
  gameId: null,
  gameName: 'Black Jokes',
  status: 'idle',
  startTimestamp: null,
  endTimestamp: null,
  pauseTimestamp: null,
  resumeTimestamp: null,
  currentRound: null,
  masterId: null,
  question: null,
  handsByPlayer: {},
  handsDetailedByPlayer: {},
  selectionsByPlayer: {},
  chosenCardsCurrentPlayer: [],
  chosenCardsAllPlayers: [],
  countOfAnswers: 0,

  roundWinner: null,
  commentatorText: null,
  finalPlayers: [],
  gameWinner: null,
  gameWinnerId: null,
  masterSelectedCardId: null,
  phase: 'default',
  timerTime: 0,
};

export const gameBjSlice = createSlice({
  name: 'gameBj',
  initialState,
  reducers: {
    /** Пришел start_game — фиксируем старт и gameId */
    setStarted(
      state,
      action: PayloadAction<{ game_id: number; timestamp?: string | null }>,
    ) {
      state.gameId = action.payload.game_id;
      state.status = 'running';
      state.startTimestamp = action.payload.timestamp ?? null;
      state.phase = 'default';
      // сбросим мету прошлого раунда на всякий случай
      state.roundWinner = null;
      state.commentatorText = null;
      state.selectionsByPlayer = {};
    },
    /** start_round */
    applyStartRound(
      state,
      action: PayloadAction<{
        current_round: number;
        master_id: number;
        card: QuestionCardWire;
        /** берем только то, что нужно для рук */
        players: Array<Pick<PlayerWire, 'id' | 'selected_cards'>>;
      }>,
    ) {
      const { current_round, master_id, card, players } = action.payload;

      state.currentRound = current_round;
      state.masterId = master_id;
      state.question = card;
      state.phase = 'player_choice';
      // Синхронизация лимита выбора карт по вопросу
      state.countOfAnswers = Number(card?.answer_count_card ?? 1);
      state.chosenCardsCurrentPlayer = [];
      state.masterSelectedCardId = null;

      const prevHands = state.handsDetailedByPlayer ?? {};
      // Сохраняем выбранные карты из предыдущего раунда перед очисткой
      const prevSelections = state.selectionsByPlayer ?? {};

      const nextHandsDetailed: Record<number, SelectedCardWire[]> = {};

      (players ?? []).forEach(p => {
        const pid = Number(p.id);
        const incomingCards: SelectedCardWire[] = Array.isArray(
          p.selected_cards,
        )
          ? p.selected_cards.map(card => {
              const cardId = Number(
                // card.card_id приходит всегда, card.id бывает, card.card?.id — запасной источник
                (card as any)?.card_id ??
                  (card as any)?.card?.id ??
                  (card as any)?.id,
              );
              return {
                id: Number((card as any)?.id ?? cardId),
                player_id: Number((card as any)?.player_id ?? pid),
                card_id: cardId,
                is_table: Boolean((card as any)?.is_table),
                is_winner: Boolean((card as any)?.is_winner),
                text: (card as any)?.text ?? (card as any)?.card?.text ?? '',
              };
            })
          : [];

        const prev = prevHands[pid] ?? [];
        // Удаляем выбранные карты из предыдущей руки
        const selectedCardIds = prevSelections[pid] ?? [];
        const prevFiltered = prev.filter(
          c => !selectedCardIds.includes(c.card_id),
        );

        const prevIds = prevFiltered.map(c => Number(c.card_id)).sort();
        const incomingIds = incomingCards.map(c => Number(c.card_id)).sort();
        const sameIds =
          prevIds.length === incomingIds.length &&
          prevIds.every((id, idx) => id === incomingIds[idx]);
        const prevMissingText = prevFiltered.some(c => !c.text);

        // Если карты совпадают (после удаления выбранных), используем предыдущие, иначе - новые с сервера
        nextHandsDetailed[pid] =
          sameIds && !prevMissingText ? prevFiltered : incomingCards;
      });

      state.handsDetailedByPlayer = nextHandsDetailed;

      state.handsByPlayer = Object.entries(nextHandsDetailed).reduce<
        Record<number, number[]>
      >((acc, [pid, arr]) => {
        acc[Number(pid)] = arr.map(c => c.card_id);
        return acc;
      }, {});
    },

    /** start_phase_player_choice_card */
    setPhasePlayerChoice(state) {
      state.phase = 'player_choice';
      state.roundWinner = null;
      state.commentatorText = null;
      state.selectionsByPlayer = {};
      state.chosenCardsCurrentPlayer = [];
      state.chosenCardsAllPlayers = [];
    },

    /** commentator (type, не event) */
    setCommentator(state, action: PayloadAction<{ text: string }>) {
      state.commentatorText = action.payload.text;
    },

    /** show_selected_cards */
    setShowSelectedCards(
      state,
      action: PayloadAction<{
        cards: Record<
          string,
          Array<{
            id?: number;
            player_id: number;
            card_id: number;
            is_table?: boolean;
            is_winner?: boolean;
            card?: { id: number; text: string };
          }>
        >;
      }>,
    ) {
      const cards = action.payload.cards ?? {};

      // Заполняем selectionsByPlayer (старая логика)
      state.selectionsByPlayer = Object.entries(cards).reduce<
        Record<number, number[]>
      >((acc, [pid, arr]) => {
        acc[Number(pid)] = Array.isArray(arr) ? arr.map(c => c.card_id) : [];
        return acc;
      }, {});

      // Заполняем chosenCardsAllPlayers для отображения мастеру
      const playersCards: typeof state.chosenCardsAllPlayers = [];

      Object.entries(cards).forEach(([pid, selectedCards]) => {
        const playerId = Number(pid);

        if (Array.isArray(selectedCards) && selectedCards.length > 0) {
          const playerChosenCards = selectedCards.map(sc => ({
            id: sc.id, // ID записи player_cards (нужен для check_choice_master_winner)
            card_id: sc.card_id, // ID самой карты
            text: sc?.card?.text || '',
            order: 0,
          }));

          if (playerChosenCards.length > 0) {
            playersCards.push({
              playerId,
              card_id: playerChosenCards[0]?.card_id ?? 0,
              cards: playerChosenCards,
              text: playerChosenCards.map(c => c.text).join('/'),
            });
          }
        }
      });

      // Перемешиваем карты для мастера
      state.chosenCardsAllPlayers = [...playersCards].sort(
        () => Math.random() - 0.5,
      );
      state.phase = 'show_selected_cards';
    },

    /** end_phase_player_choice_card */
    setEndPhasePlayerChoice(state) {
      state.phase = 'all_selected_player_card';
    },

    /** start_phase_master_choice */
    setPhaseMasterChoice(state) {
      state.phase = 'master_choice';
      state.masterSelectedCardId = null;
    },

    /** end_phase_master_choice */
    setWinner(state, action: PayloadAction<{ winner: AnswerCardWire }>) {
      state.roundWinner = action.payload.winner;
      state.phase = 'intermission';
      state.masterSelectedCardId = null;
    },
    /** Установить выбранную карту ведущего */
    setMasterSelectedCard(state, action: PayloadAction<number | null>) {
      state.masterSelectedCardId = action.payload;
    },
    setFinishGame(state, action: PayloadAction<FinishGamePayload>) {
      const { timestamp, users } = action.payload;

      state.phase = 'finish_game';
      state.endTimestamp = timestamp ?? null;

      // Подготовим удобный список для UI
      state.finalPlayers = (Array.isArray(users) ? users : []).map(u => ({
        id: Number(u.id),
        name: String(u.name),
        is_host: Boolean(u.is_host),
        is_disconnect: Boolean(u.is_disconnect),
        avatar: u.avatar ?? null,
        is_vip: Boolean(u.is_vip),
        points: Number(u.points ?? 0),
        nickname_color: u.nickname_color ?? '#FFFFFF',
        user_id: Number(u.user_id),
      }));

      // Победитель — с наибольшим количеством очков (при равенстве — первый по порядку)
      const gameWinner =
        state.finalPlayers.length > 0
          ? [...state.finalPlayers].sort(
              (a, b) => (b.points ?? 0) - (a.points ?? 0),
            )[0]
          : null;

      state.gameWinnerId = gameWinner?.user_id ?? null;
    },
    setPaused(state) {
      if (state.status === 'paused') return;
      state.status = 'paused';
      state.pauseTimestamp = new Date().toISOString();
    },
    setResumed(state) {
      if (state.status === 'running') return;
      state.status = 'running';
      state.resumeTimestamp = new Date().toISOString();
    },
    reset(state) {
      state.gameId = null;
      state.status = 'idle';
      state.startTimestamp = null;
      state.pauseTimestamp = null;
      state.resumeTimestamp = null;
      state.phase = 'default';
    },

    /** Установить количество ответов для текущего вопроса */
    setCountOfAnswers(state, action: PayloadAction<number>) {
      state.countOfAnswers = action.payload;
    },

    /** Toggle-выбор карты текущим игроком (add/remove + лимит) */
    toggleChosenCard(state, action: PayloadAction<number>) {
      const cardIdNum = Number(action.payload);
      const idx = state.chosenCardsCurrentPlayer.indexOf(cardIdNum);
      if (idx !== -1) {
        // Удаляем из выбора
        state.chosenCardsCurrentPlayer.splice(idx, 1);
        return;
      }
      // Если достигнут лимит — сбрасываем и начинаем заново
      if (
        state.countOfAnswers > 0 &&
        state.chosenCardsCurrentPlayer.length >= state.countOfAnswers
      ) {
        state.chosenCardsCurrentPlayer = [];
      }
      state.chosenCardsCurrentPlayer.push(cardIdNum);
    },

    /** Заменить полный массив выбранных карт (для синхронизации) */
    setChosenCardsCurrentPlayer(state, action: PayloadAction<number[]>) {
      state.chosenCardsCurrentPlayer = action.payload;
    },
    /** Если игроки сделали выбор - 3 секунды на перевыбор */
    setAllSelectedCountdown(
      state,
      action: PayloadAction<AllSelectedPlayerCard>,
    ) {
      state.status = 'running';
      state.phase = 'all_selected_player_card';
      state.timerTime = action.payload.time;
    },
    /** Установить все выбранные карты всех игроков (для отображения мастеру) */
    setAllChosenCardsPlayers(
      state,
      action: PayloadAction<
        Array<{
          card_id: number;
          text: string;
          order?: number;
          player_id?: number;
          id?: number; // ID записи player_cards
        }>
      >,
    ) {
      const cards = action.payload;
      const playersCards: typeof state.chosenCardsAllPlayers = [];

      // Группируем карты по игрокам из handsDetailedByPlayer
      Object.entries(state.handsDetailedByPlayer).forEach(
        ([playerId, playerCards]) => {
          const pid = Number(playerId);

          // Находим выбранные карты этого игрока и сортируем по order
          const playerChosenCards = cards
            .filter(responseCard =>
              playerCards.some(c => c.card_id === responseCard.card_id),
            )
            .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
            .map(card => {
              // Найти id записи player_cards из handsDetailedByPlayer
              const playerCard = playerCards.find(
                pc => Number(pc.card_id) === Number(card.card_id),
              );
              return {
                id: card.id || playerCard?.id, // Используем id из payload или из handsDetailedByPlayer
                card_id: card.card_id,
                text: card.text,
              };
            });

          if (playerChosenCards.length > 0) {
            const groupedCard = {
              playerId: pid,
              id: playerChosenCards[0]?.id || playerChosenCards[0]!.card_id,
              card_id: playerChosenCards[0]!.card_id,
              cards: playerChosenCards,
              text: playerChosenCards.map(c => c.text).join('/'),
            };

            playersCards.push(groupedCard);
          }
        },
      );

      state.chosenCardsAllPlayers = [...playersCards].sort(
        () => Math.random() - 0.5,
      );
    },

    setTimerTime(state, action: PayloadAction<number>) {
      state.timerTime = Number(action.payload) || 0;
    },

    setIsTimerRun(state, action: PayloadAction<boolean>) {
      const next = Boolean(action.payload);
      if (state.status === 'idle' && !next) return;
      state.status = next ? 'running' : 'paused';
    },
  },
});
export const {
  setStarted,
  setPaused,
  setResumed,
  reset,
  applyStartRound,
  setPhasePlayerChoice,
  setCommentator,
  setAllSelectedCountdown,
  setShowSelectedCards,
  setEndPhasePlayerChoice,
  setPhaseMasterChoice,
  setWinner,
  setFinishGame,
  setCountOfAnswers,
  toggleChosenCard,
  setChosenCardsCurrentPlayer,
  setAllChosenCardsPlayers,
  setMasterSelectedCard,
  setTimerTime,
  setIsTimerRun,
} = gameBjSlice.actions;
export default gameBjSlice.reducer;

/* ===== СЕЛЕКТОРЫ (отдельные const) ===== */

export const selectGameBjState = (state: { gameBj: GameBjState }) =>
  state.gameBj;

export const selectGameId = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).gameId;
export const selectGameName = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).gameName;
export const selectGameStatus = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).status;
export const selectGameStartTs = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).startTimestamp;
export const selectPauseTimestamp = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).pauseTimestamp;
export const selectResumeTimestamp = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).resumeTimestamp;

export const selectCurrentRound = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).currentRound;
export const selectMasterId = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).masterId;
export const selectQuestion = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).question;

export const selectHandsByPlayer = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).handsByPlayer;
export const selectHandsDetailedByPlayer = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).handsDetailedByPlayer;

export const selectSelectionsByPlayer = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).selectionsByPlayer;

export const selectRoundWinner = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).roundWinner;
export const selectWinner = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).gameWinner;
export const selectGameWinnerId = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).gameWinnerId;
export const selectCommentator = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).commentatorText;

export const selectPhase = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).phase;

export const selectTimerTime = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).timerTime;

export const selectIsTimerRun = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).status === 'running';

export const selectFinalPlayers = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).finalPlayers;

export const selectEndTimestamp = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).endTimestamp;

export const selectChosenCardsCurrentPlayer = (state: {
  gameBj: GameBjState;
}) => selectGameBjState(state).chosenCardsCurrentPlayer;

export const selectAllChosenCards = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).chosenCardsAllPlayers;

export const selectCountOfAnswers = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).countOfAnswers;

export const selectMasterSelectedCardId = (state: { gameBj: GameBjState }) =>
  selectGameBjState(state).masterSelectedCardId;

/** Получить руку конкретного игрока (массив card_id) */
export const selectHandForPlayer = (
  state: { gameBj: GameBjState },
  playerId: number | null | undefined,
) => {
  if (playerId == null) return EMPTY_ARRAY;
  return selectHandsByPlayer(state)[playerId] ?? EMPTY_ARRAY;
};

/** Получить детальную руку конкретного игрока */
export const selectHandDetailedForPlayer = (
  state: { gameBj: GameBjState },
  playerId: number | null | undefined,
) => {
  if (playerId == null) return EMPTY_ARRAY;
  return selectHandsDetailedByPlayer(state)[playerId] ?? EMPTY_ARRAY;
};

/** Получить выбранные карты конкретного игрока */
export const selectSelectionsForPlayer = (
  state: { gameBj: GameBjState },
  playerId: number | null | undefined,
) => {
  if (playerId == null) return EMPTY_ARRAY;
  return selectSelectionsByPlayer(state)[playerId] ?? EMPTY_ARRAY;
};
