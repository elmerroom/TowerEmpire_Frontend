// src/store/api/lobbyApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../shared/api/baseQueryWithReauth';
import { LOBBY } from '../../shared/config/endpoints';
import type { components } from '../../shared/api/types.gen';
import {
  roomCreateResponseSchema,
  roomResponseListSchema,
  validateApiResponse,
} from '@/shared/lib/validation/api';

type RoomResponse = components['schemas']['RoomResponse'];
type RoomCreateSchema = components['schemas']['RoomCreateSchema'];
type RoomCreateResponse = components['schemas']['RoomCreateResponse'];
type JoinRoomSchema = components['schemas']['JoinRoomSchema'];

interface LobbyErrorData {
  detail?: string;
  error?: string;
  password?: string[];
  title?: string[];
}

interface LobbyErrorResponse {
  status?: number;
  data?: LobbyErrorData;
}

export const lobbyApi = createApi({
  reducerPath: 'lobbyApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Lobby'],
  endpoints: build => ({
    getLobbies: build.query<RoomResponse[], void>({
      query: () => ({
        url: LOBBY.list,
        method: 'GET',
      }),
      transformResponse: (response): RoomResponse[] => {
        const validated = validateApiResponse(
          roomResponseListSchema,
          response,
          'lobby/getLobbies',
        );
        return validated.map(room => ({
          ...room,
          players: room.players.map(player => ({
            ...player,
            user_id: player.user_id ?? player.id ?? 0,
          })),
        }));
      },
      providesTags: result =>
        result
          ? [
              { type: 'Lobby' as const, id: 'LIST' },
              ...result.map(room => ({ type: 'Lobby' as const, id: room.id })),
            ]
          : [{ type: 'Lobby' as const, id: 'LIST' }],
    }),
    createLobby: build.mutation<RoomCreateResponse, RoomCreateSchema>({
      query: body => ({
        url: LOBBY.create,
        method: 'POST',
        body,
      }),
      transformResponse: (response): RoomCreateResponse => {
        const validated = validateApiResponse(
          roomCreateResponseSchema,
          response,
          'lobby/createLobby',
        );
        return {
          ...validated,
          players: validated.players.map(player => ({
            ...player,
            user_id: player.user_id ?? player.id ?? 0,
          })),
        };
      },
      invalidatesTags: [{ type: 'Lobby', id: 'LIST' }],
      transformErrorResponse: (response: LobbyErrorResponse) => ({
        status: response.status,
        message:
          response.data?.title?.[0] ??
          response.data?.detail ??
          response.data?.error ??
          'Не удалось создать комнату',
        originalData: response.data,
      }),
    }),

    joinLobby: build.mutation<
      unknown,
      { room_id: number; body: JoinRoomSchema }
    >({
      query: ({ room_id, body }) => ({
        url: LOBBY.join(room_id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Lobby', id: arg.room_id },
        { type: 'Lobby', id: 'LIST' },
      ],
      transformErrorResponse: (response: LobbyErrorResponse) => {
        const detail = response.data?.detail;
        if (response.status === 404) {
          return {
            status: 404,
            code: 'ROOM_NOT_FOUND' as const,
            message: detail || 'Комната удалена или не существует.',
          };
        }
        return {
          status: response.status,
          message:
            detail ??
            response.data?.password?.[0] ??
            'Не удалось войти в комнату',
          details: response.data,
        };
      },
    }),
  }),
});

export const {
  useGetLobbiesQuery,
  useCreateLobbyMutation,
  useJoinLobbyMutation,
} = lobbyApi;
