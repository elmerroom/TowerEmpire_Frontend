import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiBase, USERS } from '../../../shared/config/endpoints';

export const gamePlayersApi = createApi({
  reducerPath: 'gamePlayersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBase,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().user.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: build => ({
    /**
     *Получить всех игроков в конкретной игре.
     */
    getPlayersInGame: build.query({
      query: gameId => USERS.players(gameId),
    }),
  }),
});

export const { useGetPlayersInGameQuery, useLazyGetPlayersInGameQuery } =
  gamePlayersApi;
