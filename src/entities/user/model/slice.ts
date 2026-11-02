import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Note: Ensure userApi is imported from the correct entities/user location or store/api during migration.
// Right now we rely on the migrated one. We'll fix userApi import later.
import { userApi } from '@/entities/user/api/user-api'; // Will update if moved
import { UserAchievement, UserStatistic } from './types';

export interface UserState {
  user_id: number | null;
  username: string | null;
  email: string | null;
  isRedirected: boolean;
  isAuth: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  date_joined: string | null;
  avatar: string | null;
  isGuest: boolean;
  nickname_color: string | null;
  is_vip: boolean;
  exp: number;
  achievements: UserAchievement[];
  statistics: UserStatistic[];
}

const initialState: UserState = {
  user_id: null,
  username: null,
  email: null,
  isRedirected: false,
  isAuth: false,
  accessToken: null,
  refreshToken: null,
  date_joined: null,
  avatar: null,
  isGuest: false,
  nickname_color: null,
  is_vip: false,
  exp: 0,
  achievements: [],
  statistics: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(
      state,
      {
        payload,
      }: PayloadAction<{
        user_id: number;
        username: string;
        email: string | null;
        date_joined: string | null;
        avatar: string | null;
        isGuest?: boolean;
        nickname_color?: string | null;
        is_vip?: boolean;
        exp?: number;
        achievements?: UserAchievement[];
        statistics?: UserStatistic[];
      }>,
    ) {
      console.log('SETUSER', payload);
      state.user_id = payload.user_id;
      state.username = payload.username;
      state.email = payload.email;
      state.date_joined = payload.date_joined;
      state.avatar = payload.avatar;
      state.isGuest = payload.isGuest || false;
      state.nickname_color = payload.nickname_color || state.nickname_color;
      state.is_vip = payload.is_vip ?? state.is_vip;
      state.exp = payload.exp ?? state.exp;
      state.achievements = payload.achievements || state.achievements;
      state.statistics = payload.statistics || state.statistics;
    },
    setTokens(
      state,
      {
        payload: { access, refresh },
      }: PayloadAction<{ access: string; refresh?: string }>,
    ) {
      state.accessToken = access;
      if (refresh !== undefined) {
        state.refreshToken = refresh;
      }
      state.isAuth = true;
    },
    setAuth: (state, { payload }: PayloadAction<boolean>) => {
      state.isAuth = payload;
    },
    setRedirected: (state, { payload }: PayloadAction<boolean>) => {
      state.isRedirected = payload;
    },
    clearUser: state => {
      sessionStorage.removeItem('refreshToken');
      Object.assign(state, initialState);
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      userApi.endpoints.getPersonalArea.matchFulfilled,
      (state, { payload }) => {
        if (payload.avatar) state.avatar = payload.avatar;
        if (payload.username) state.username = payload.username;
        if (payload.email) state.email = payload.email;
        if (payload.nickname_color)
          state.nickname_color = payload.nickname_color;
        if (payload.exp !== undefined) state.exp = payload.exp;
        if (payload.is_vip !== undefined) state.is_vip = payload.is_vip;
      },
    );
    builder.addMatcher(
      userApi.endpoints.updateProfile.matchFulfilled,
      (state, { payload }) => {
        if (payload.avatar) state.avatar = payload.avatar;
        if (payload.username) state.username = payload.username;
        if (payload.email) state.email = payload.email;
        if (payload.nickname_color)
          state.nickname_color = payload.nickname_color;
      },
    );
  },
  selectors: {
    getUser: state => state,
    getUserId: state => state.user_id,
    getAccessToken: state => state.accessToken,
    getUsername: state => state.username,
    getUserEmail: state => state.email,
    getIsAuth: state => state.isAuth,
    getIsGuest: state => state.isGuest,
  },
});

export const { setUser, setRedirected, setAuth, setTokens, clearUser } =
  userSlice.actions;
export const {
  getUser,
  getUserId,
  getAccessToken,
  getUsername,
  getIsAuth,
  getUserEmail,
  getIsGuest,
} = userSlice.selectors;
export default userSlice.reducer;
