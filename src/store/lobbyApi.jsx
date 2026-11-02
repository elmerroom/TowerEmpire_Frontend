import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../shared/api/baseQueryWithReauth';

const LOBBY_TAG = 'Lobby';
export const LobbyApi = createApi({
  reducerPath: 'LobbyApi',
  tagTypes: ['Lobby', 'NickColor', 'Credentials'],
  baseQuery: baseQueryWithReauth,
  endpoints: build => ({
    getVersion: build.query({
      query: () => ({
        url: 'core/version/',
        method: 'GET',
        requireAuth: false,
      }),
    }),
    getLobbys: build.query({
      query: () => ({
        url: 'base/lobby/',
        method: 'GET',
        requireAuth: false,
      }),
      providesTags: () => [LOBBY_TAG],
    }),
    createLobby: build.mutation({
      query: body => ({
        method: 'POST',
        url: `base/lobby/`,
        body,
      }),
      invalidatesTags: [LOBBY_TAG],
      transformErrorResponse: response => ({
        status: response.status,
        message:
          response.data?.title?.[0] ||
          response.data?.detail ||
          response.data?.error ||
          'Что-то пошло не так',
        originalData: response.data,
      }),
    }),
    retrieveLobby: build.query({
      query: ({ id }) => ({
        method: 'GET',
        url: `base/lobby/${id}`,
      }),

      transformErrorResponse: response => ({
        status: response.status,
        message: 'Не удалось получить данные лобби',
        details: response.data,
      }),
    }),
    enterLobby: build.mutation({
      query: body => ({
        method: 'PATCH',
        url: `base/lobby/${body.id}/`,
        body: {
          password: body.password,
        },
      }),
      invalidatesTags: [LOBBY_TAG],
      transformErrorResponse: response => {
        const detail = response.data?.detail;
        if (response.status === 404) {
          return {
            status: 404,
            code: 'ROOM_NOT_FOUND',
            message:
              detail === 'No Room matches the given query.'
                ? 'Комната была удалена или не существует'
                : detail || 'Ресурс не найден',
          };
        }
        return {
          status: response.status,
          message:
            detail || response.data?.password?.[0] || 'ошибка входа в комнату',
          details: response.data,
        };
      },
    }),
  }),
});

// eslint-disable-next-line react-refresh/only-export-components
export const {
  useGetLobbysQuery,
  useCreateLobbyMutation,
  useRetrieveLobbyQuery,
  useEnterLobbyMutation,
  useGetVersionQuery,
} = LobbyApi;
