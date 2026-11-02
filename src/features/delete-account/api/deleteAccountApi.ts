import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiBase, USERS } from '../../../shared/config/endpoints';

export const deleteAccountApi = createApi({
  reducerPath: 'deleteAccount',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBase,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { user?: { accessToken?: string } };
      const token = state.user?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: build => ({
    deleteUserAccount: build.mutation<void, void>({
      query: () => ({
        url: USERS.delete,
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useDeleteUserAccountMutation } = deleteAccountApi;
