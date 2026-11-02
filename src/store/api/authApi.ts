import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../shared/api/baseQueryWithReauth';
import { USERS } from '../../shared/config/endpoints';
import {
  LoginRequest,
  LoginTempRequest,
  TokenResponse,
  UserCreate,
  TempUserCreate,
  GenerateCode,
  RecoveryPassword,
  ResetPassword,
  TempTokenRequest,
  RefreshResponse,
  RefreshRequest,
  TokenPair,
} from './types';
import {
  tokenPairSchema,
  refreshResponseSchema,
  validateApiResponse,
} from '@/shared/lib/validation/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: build => ({
    login: build.mutation<TokenResponse, LoginRequest>({
      query: body => ({
        url: USERS.token,
        method: 'POST',
        body,
      }),
      transformResponse: response =>
        validateApiResponse(tokenPairSchema, response, 'auth/login'),
    }),
    loginTemp: build.mutation<TokenResponse, LoginTempRequest>({
      query: body => ({
        url: USERS.tokenTemp,
        method: 'POST',
        body,
      }),
      transformResponse: response =>
        validateApiResponse(tokenPairSchema, response, 'auth/loginTemp'),
    }),
    registration: build.mutation<void, UserCreate>({
      query: body => ({
        url: USERS.create,
        method: 'POST',
        body,
      }),
    }),
    tempRegistration: build.mutation<void, TempUserCreate>({
      query: body => ({
        url: USERS.createTemp,
        method: 'POST',
        body,
      }),
    }),
    // ГОСТЕВОЙ ТОКЕН БЕЗ ПАРОЛЯ
    getTempToken: build.mutation<TokenPair, TempTokenRequest>({
      query: body => ({
        url: USERS.tokenTemp,
        method: 'POST',
        body,
      }),
      transformResponse: response =>
        validateApiResponse(tokenPairSchema, response, 'auth/getTempToken'),
      transformErrorResponse: (resp: any) => {
        const detail = resp?.data?.detail;
        const msgArray = Array.isArray(detail)
          ? detail.map((d: any) => d?.msg).join(', ')
          : null;
        return {
          status: resp?.status,
          message:
            msgArray ||
            detail ||
            resp?.data?.error ||
            resp?.error ||
            'Auth error',
          original: resp,
        };
      },
    }),
    refresh: build.mutation<RefreshResponse, RefreshRequest>({
      query: body => ({
        url: USERS.tokenRefresh,
        method: 'POST',
        body,
      }),
      transformResponse: response =>
        validateApiResponse(refreshResponseSchema, response, 'auth/refresh'),
    }),
    sendCodeToEmail: build.mutation<void, GenerateCode>({
      query: body => ({
        url: USERS.generateCode,
        method: 'POST',
        body,
      }),
    }),
    confirmCode: build.mutation<void, string>({
      query: token => ({
        url: USERS.createAccessEmail(token),
        method: 'GET',
      }),
    }),
    resetPassword: build.mutation<void, ResetPassword>({
      query: body => ({
        url: USERS.resetPassword,
        method: 'POST',
        body,
      }),
    }),
    recoveryPassword: build.mutation<void, RecoveryPassword>({
      query: body => ({
        url: USERS.recoveryPassword,
        method: 'POST',
        body,
      }),
    }),
    resendConfirmationEmail: build.mutation<void, LoginRequest>({
      query: body => ({
        url: USERS.resendConfirmationEmail,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLoginTempMutation,
  useRegistrationMutation,
  useTempRegistrationMutation,
  useRefreshMutation,
  useSendCodeToEmailMutation,
  useConfirmCodeMutation,
  useResetPasswordMutation,
  useRecoveryPasswordMutation,
  useGetTempTokenMutation,
  useResendConfirmationEmailMutation,
} = authApi;
