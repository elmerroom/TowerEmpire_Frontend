// src/entities/user/api/userApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { baseQueryWithReauth } from '../../../shared/api/baseQueryWithReauth';
import { USERS } from '../../../shared/config/endpoints';
import {
  nickColorSchema,
  updatedUserResponseSchema,
  userProfileSchema,
  validateApiResponse,
} from '@/shared/lib/validation/api';

// Минимальный тип профиля, покрывающий то, что читает useAuth + stat slice
export interface Rank {
  name: string;
}

export interface PlayerStat {
  id: number;
  game_name: string;
  total_game: number;
  won_game: number;
}

export interface AchievementDetail {
  name: string;
  desc: string;
}

export interface UserAchievement {
  achievement: AchievementDetail;
  game_name: string;
  receiving_cond: string | null;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  date_joined: string;
  avatar: string | null;
  dracoins: number;
  is_vip: boolean;
  its_vip_time: string | null;
  exp: number;
  rank: Rank | null;
  is_active: boolean;
  nickname_color: string | null;
  statistics: PlayerStat[];
  achievements: UserAchievement[];
}

export interface NickColor {
  nickname_color: string;
}

export interface UpdatedUserProfile {
  username: string;
  email: string | null;
  avatar: string | null;
  nickname_color: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth as unknown as BaseQueryFn,
  tagTypes: ['User', 'NickColor'],
  endpoints: build => ({
    // GET /api/users/personal_area/ (Bearer)
    getPersonalArea: build.query<UserProfile, void>({
      query: () => ({ url: USERS.personalArea, method: 'GET' }),
      transformResponse: response =>
        validateApiResponse(
          userProfileSchema,
          response,
          'user/getPersonalArea',
        ),
      providesTags: [{ type: 'User', id: 'ME' }],
    }),

    // PATCH /api/users/update/ (Bearer)
    updateProfile: build.mutation<UpdatedUserProfile, Partial<UserProfile>>({
      query: body => ({ url: USERS.update, method: 'PATCH', body }),
      transformResponse: response =>
        validateApiResponse(
          updatedUserResponseSchema,
          response,
          'user/updateProfile',
        ),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
      transformErrorResponse: (response: any) => ({
        status: response?.status,
        message:
          response?.data?.username?.[0] ??
          response?.data?.detail ??
          response?.data?.error ??
          'Не удалось обновить профиль',
        originalData: response?.data,
      }),
    }),

    getNickCol: build.mutation<NickColor, void>({
      query: () => ({
        url: USERS.nicknameColor,
        method: 'GET',
      }),
      transformResponse: response =>
        validateApiResponse(nickColorSchema, response, 'user/getNickCol'),
      invalidatesTags: [{ type: 'NickColor', id: 'ME' }],
    }),
  }),
});

export const {
  useGetPersonalAreaQuery,
  useLazyGetPersonalAreaQuery,
  useUpdateProfileMutation,
  useGetNickColMutation,
} = userApi;
