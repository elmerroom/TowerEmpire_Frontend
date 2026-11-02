import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gameMode: false,
  host: false,
  title: '',
  text: '',
  colorText: '',
  confirm: '',
  results: [],
  primaryBtn: '',
  secondaryBtn: '',
  thirdBtn: '',
  showButtons: true,
  openModals: {},
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setGameMode(state, action) {
      // console.log('SETUSER', action.payload);
      state.gameMode = action.payload;
    },
    setModalContent(state, action) {
      state.title = action.payload.title;
      if (action.payload.title == 'удаление игрока') {
        state.text = 'Вы собираетесь исключить из игры игрока';
        state.colorText = action.payload.colorText;
        state.confirm = 'Подтверждаете ваш выбор?';
        state.primaryBtn = 'Да';
        state.secondaryBtn = 'Нет';
        state.thirdBtn = '';
      }
      if (action.payload.title == 'настройки') {
        state.primaryBtn = 'Сохранить';
        state.secondaryBtn = 'Ссылка для приглашений';
        state.thirdBtn = '';
      }
      if (action.payload.title == 'Выход из игры') {
        state.text = action.payload.host
          ? 'Покидая игру, права хоста будут автоматически переданы следующему игроку'
          : 'Уверены, что хотите покинуть игру?';
        state.colorText = action.payload.host ? '' : '';
        state.primaryBtn = action.payload.host ? 'Выйти' : 'Да';
        state.secondaryBtn = action.payload.host ? 'К выбору игры' : 'Нет';
        state.thirdBtn = action.payload.host ? 'Распустить комнату' : '';
      }
      if (action.payload.title == 'результаты игры') {
        state.confirm = `Продолжительность игры составила ${action.payload.time}`;
        state.colorText = 'Спасибо за игру!';
        state.results = action.payload.winners;
        state.primaryBtn = action.payload.host ? 'Еще раз' : 'Назад в комнату';
        state.secondaryBtn = action.payload.host
          ? 'Назад в комнату'
          : 'Автовыход 10 сек';
        state.thirdBtn = action.payload.host ? 'Распустить комнату' : '';
      }
    },
    setCommandModalContent(state, action) {
      state.title = action.payload.title || '';
      state.text = action.payload.text || '';
      state.showButtons = false;
    },
    openModal(state, action) {
      if (typeof action.payload === 'string') {
        state.openModals[action.payload] = true;
      } else {
        const { id, data } = action.payload;
        state.openModals[id] = data || true;
      }
    },
    closeModal(state, action) {
      state.openModals[action.payload] = false;
    },
    clearModal(state) {
      // state = initialState;
      state.host = false;
      state.title = '';
      state.text = '';
      state.colorText = '';
      state.confirm = '';
      state.primaryBtn = '';
      state.secondaryBtn = '';
      state.thirdBtn = '';
      state.showButtons = true;
    },

    // setRedirected(state, action) {
    //   state.isRedirected = action.payload;
    // },
    // setAuth(state, action) {
    //   // console.log(action.payload)
    //   state.isAuth = action.payload;
    // },
  },
  selectors: {
    getGameMode: state => state.gameMode,
    selectIsModalOpen: (state, id) => !!state.openModals[id],
    selectModalData: (state, id) => {
      const val = state.openModals[id];
      return val && typeof val === 'object' ? val : null;
    },
  },
});
export const { getGameMode, selectIsModalOpen, selectModalData } =
  modalSlice.selectors;

export const {
  setGameMode,
  clearModal,
  setModalContent,
  setCommandModalContent,
  showButtons,
  openModal,
  closeModal,
} = modalSlice.actions;

export default modalSlice.reducer;
