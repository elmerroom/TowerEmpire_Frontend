import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export type ChatMessage = {
  message: string;
  user?: { id?: number; username?: string } | null;
  [key: string]: any;
};

type PromotedUser = { id: number | null; username?: string };
type DeletedUser = { id: number | null; username: string };
type Infomessage = { isSuccess: boolean; message: string | null };

export type LobbyUiState = {
  /**
   * Chat entries visible in the room.
   */
  roomChat: ChatMessage[];
  /**
   * Chat entries visible in game channel.
   */
  gameChat: ChatMessage[];
  infoMessage: Infomessage;
  promotedUser: PromotedUser;
  deletedUser: DeletedUser;
  password: string;
  resetChatCountersFlag: boolean;
  isKicked: boolean;
};

const initialState: LobbyUiState = {
  roomChat: [],
  gameChat: [],
  infoMessage: { isSuccess: false, message: null },
  promotedUser: { id: null, username: '' },
  deletedUser: { id: null, username: '' },
  password: '',
  resetChatCountersFlag: false,
  isKicked: false,
};

const lobbyUiSlice = createSlice({
  name: 'lobbyUi',
  initialState,
  reducers: {
    setRoomChat(state, action: PayloadAction<ChatMessage>) {
      state.roomChat.push(action.payload);
    },
    setGameChat(state, action: PayloadAction<ChatMessage>) {
      state.gameChat.push(action.payload);
    },
    clearChats(state) {
      state.roomChat = [];
      state.gameChat = [];
    },
    resetChatCounters(state) {
      state.resetChatCountersFlag = !state.resetChatCountersFlag;
    },
    setInfoMessage(state, action: PayloadAction<Infomessage>) {
      state.infoMessage = action.payload;
    },
    setPromotedUser(state, action: PayloadAction<PromotedUser>) {
      state.promotedUser = action.payload;
    },
    setDeletedUser(state, action: PayloadAction<DeletedUser>) {
      state.deletedUser = action.payload;
    },
    setRoomPassword(state, action: PayloadAction<string | null | undefined>) {
      state.password = action.payload ?? '';
    },
    setIsKicked(state, action: PayloadAction<boolean>) {
      state.isKicked = action.payload;
    },
    resetLobbyUi: () => initialState,
  },
});

export const {
  setRoomChat,
  setGameChat,
  clearChats,
  resetChatCounters,
  setInfoMessage,
  setPromotedUser,
  setDeletedUser,
  setRoomPassword,
  setIsKicked,
  resetLobbyUi,
} = lobbyUiSlice.actions;

export default lobbyUiSlice.reducer;

export const selectRoomChat = (state: RootState) => state.lobbyUi.roomChat;
export const selectGameChat = (state: RootState) => state.lobbyUi.gameChat;
export const selectResetChatCountersFlag = (state: RootState) =>
  state.lobbyUi.resetChatCountersFlag;
export const selectPromotedUser = (state: RootState) =>
  state.lobbyUi.promotedUser;
export const selectDeletedUser = (state: RootState) =>
  state.lobbyUi.deletedUser;
export const selectLobbyInfoMessage = (state: RootState) =>
  state.lobbyUi.infoMessage;
export const selectLobbyPassword = (state: RootState) => state.lobbyUi.password;
export const selectIsKicked = (state: RootState) => state.lobbyUi.isKicked;
