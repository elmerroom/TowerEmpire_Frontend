import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  gameId: '',
  gameName: '',
  gameStatus: '',
  gamePhase: '',
  previousPhase: null,
  isTimerRun: false,
  countOfAnswers: 0,
  chosenCardsCurrentPlayer: [],
  chosenCardsAllPlayers: [],
  currentWinner: {},
  startRoundTime: 0,
  endGameTime: '',
  endGamePlayers: [],
  //chosenCardMaster: 0, // id выбранной карты ведущим (пока не реализовано на сервере, нет необходимости)
  currentRound: {
    id: 1,
    roundNumber: null,
    text: '',
    cardType: '',
    timerTime: 15,
  },
  players: {},
  rounds: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameId(state, action) {
      state.gameId = action.payload;
    },
    startNewRound(state, action) {
      const { id, roundNumber, text, cardType, roundTimeSetting } =
        action.payload;

      state.chosenCardsCurrentPlayer = [];
      state.chosenCardsAllPlayers = [];
      state.countOfAnswers = 0;
      state.currentRound = {
        ...state.currentRound,
        id,
        roundNumber,
        text,
        cardType,
        timerTime: roundTimeSetting ?? state.currentRound.timerTime,
      }; // Обновляем текущий раунд
      state.rounds.push({ id, roundNumber, text, cardType }); // Сохраняем историю раундов
    },
    setPlayers(state, action) {
      const newPlayers = action.payload;
      state.players = {};
      newPlayers.forEach(({ player }) => {
        const { user_id, is_master, cards, points } = player;
        state.players[user_id] = { isMaster: is_master, cards, points };
      });
    },
    addGamePlayer(state, action) {
      const { user_id, is_master, cards } = action.payload;
      if (!state.players[user_id]) {
        state.players[user_id] = { isMaster: is_master, cards };
      }
    },
    removePlayer(state, action) {
      const userId = action.payload;
      state.players[userId];
    },
    updatePlayerCards(state, action) {
      const { userId, cards } = action.payload;
      if (state.players[userId]) {
        state.players[userId].cards = cards;
      }
    },
    clearPlayers(state) {
      state.players = {};
    },
    endCurrentRound(state) {
      state.currentRound = 1;
    },
    setGameStatus(state, action) {
      // Статус 'игра на паузе' или игра идет
      state.gameStatus = action.payload;
    },
    setGamePhase(state, action) {
      // Фазы раунда игры
      state.gamePhase = action.payload;
    },
    setPreviousPhase: (state, action) => {
      // Сохраняем предыдущую фазу игры
      state.previousPhase = action.payload;
    },
    resetGame: () => initialState,
    // обращение к картам пользователя. изменять состояние chosen при нажатии на карточку
    setCardIsChosen(state, action) {
      // Проверяем фазу игры и находим текущую карту
      if (
        action.payload.gamePhase === 'playing' ||
        action.payload.gamePhase === 'all_selected_player_card'
      ) {
        const currentCard = state.players[action.payload.userId].cards.find(
          card => card.card_id.toString() === action.payload.cardId.toString(),
        );
        if (!currentCard) return;
        // Игнорируем повторные нажатия на одну и ту же карту
        if (
          state.chosenCardsCurrentPlayer.some(
            c => c.card_id === currentCard.card_id,
          )
        )
          return;
        // Если количество выбранных карт игрока равно количеству ответов в раунде,
        // сбрасываем обе карты и выбираем сначала
        if (state.countOfAnswers === state.chosenCardsCurrentPlayer.length) {
          state.chosenCardsCurrentPlayer.forEach(chosenCard => {
            const cardToUnchoose = state.players[
              action.payload.userId
            ].cards.find(c => c.card_id === chosenCard.card_id);

            if (cardToUnchoose) cardToUnchoose.chosen = false;
          });
          state.chosenCardsCurrentPlayer = [];
        }
        // Добавляем ссылку на выбранную карту в массив выбранных карт игрока
        state.chosenCardsCurrentPlayer.push(currentCard);
        // Изменяем параметр chosen у текущей карты
        currentCard.chosen = true;
      }
    },
    setTimerTime(state, action) {
      // Если currentRound не объект, создаем его
      if (
        typeof state.currentRound !== 'object' ||
        state.currentRound === null
      ) {
        state.currentRound = { timerTime: 10 };
      }
      state.currentRound.timerTime = action.payload;
    },
    setIsTimerRun(state, action) {
      state.isTimerRun = action.payload;
    },
    setAllChosenCardsPlayers(state, action) {
      const playersCards = [];

      Object.entries(state.players).forEach(([playerId, player]) => {
        if (player.isMaster) return;

        // Находим выбранные карты и сортируем по order - последовательность кликов
        const playerChosenCards = action.payload
          .filter(responseCard =>
            player.cards.some(c => c.card_id === responseCard.card_id),
          )
          .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
          .map(card => ({ card_id: card.card_id, text: card.text }));

        if (playerChosenCards.length > 0) {
          const groupedCard = {
            playerId,
            card_id: playerChosenCards[0].card_id,
            cards: playerChosenCards,
            text: playerChosenCards.map(c => c.text).join('/'),
          };

          playersCards.push(groupedCard);
        }
      });
      // перемешиваем карты
      state.chosenCardsAllPlayers = [...playersCards].sort(
        () => Math.random() - 0.5,
      );
    },
    setCountOfAnswers(state, action) {
      state.countOfAnswers = action.payload;
    },
    setCurrentWinner(state, action) {
      state.currentWinner = action.payload;
    },
    setStartRoundTime(state, action) {
      state.startRoundTime = action.payload;
    },
    setEndGameTime(state, action) {
      state.endGameTime = action.payload;
    },
    setEndGamePlayers(state, action) {
      const endGamePlayers = action.payload;
      state.endGamePlayers = endGamePlayers;
      console.log(endGamePlayers);

      endGamePlayers.forEach(player => {
        const { id, points } = player;
        const playerIdString = id.toString();
        if (state.players[playerIdString]) {
          state.players[playerIdString].points = points;
        }
      });
    },
  },
  selectors: {
    getGameStatus: state => state.gameStatus,
    getTimerTime: state => state.currentRound.timerTime,
    getGamePhase: state => state.gamePhase,
    getIsTimerRun: state => state.isTimerRun,
    getCountOfAnswers: state => state.countOfAnswers,
    getChosenCards: state =>
      state.chosenCardsCurrentPlayer.map(card => card.card_id),
    getAllChosenCards: state => state.chosenCardsAllPlayers,
    getMasterChosenCard: state => state.chosenCardMaster,
    getGameId: state => state.gameId,
    getCurrentRound: state => state.currentRound.id,
    getRoundNumber: state => state.currentRound.roundNumber,
    getRoundQuestion: state => state.currentRound.text || 'Ожидание вопроса...',
    getCurrentWinner: state => state.currentWinner,
    getStartRoundTime: state => state.startRoundTime,
    getEndGameTime: state => state.endGameTime,
    getEndGamePlayers: state => state.endGamePlayers,
    getPlayers: state => state.players,
  },
});
export const {
  setGameId,
  setEndGamePlayers,
  startNewRound,
  endCurrentRound,
  setGameStatus,
  setGamePhase,
  setEndGameTime,
  setPreviousPhase,
  resetGame,
  removePlayer,
  setPlayers,
  setCardIsChosen,
  setTimerTime,
  setIsTimerRun,
  setAllChosenCardsPlayers,
  setCountOfAnswers,
  setCurrentWinner,
  setStartRoundTime,
} = gameSlice.actions;

export const {
  getGameStatus,
  getTimerTime,
  getGamePhase,
  getEndGameTime,
  getIsTimerRun,
  getCountOfAnswers,
  getChosenCards,
  getEndGamePlayers,
  getAllChosenCards,
  getMasterChosenCard, // Этого нет в поле state, еще не реализовано на сервере?
  getGameId,
  getCurrentRound,
  getRoundNumber,
  getRoundQuestion,
  getCurrentWinner,
  getStartRoundTime,
  getPlayers,
} = gameSlice.selectors;

export default gameSlice.reducer;
