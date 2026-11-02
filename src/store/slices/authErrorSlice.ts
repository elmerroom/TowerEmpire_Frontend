/**
 * Redux slice для глобальных auth ошибок.
 *
 * Хранит последнюю auth ошибку в Redux state,
 * чтобы любой компонент мог прочитать и отобразить её.
 *
 * Интеграция:
 * - baseQueryWithReauth dispatch setError() при 4xx/5xx
 * - Компоненты читают selectAuthErrorMessage()
 * - clearError() вызывается при успешном login или вручную
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthError } from '@/features/auth/model/errors/types';
import {
  AuthErrorAction,
  AuthErrorType,
} from '@/features/auth/model/errors/types';

interface AuthErrorState {
  error: AuthError | null;
  lastErrorTime: number | null;
}

const initialState: AuthErrorState = {
  error: null,
  lastErrorTime: null,
};

const authErrorSlice = createSlice({
  name: 'authError',
  initialState,
  reducers: {
    setError(state, action: PayloadAction<AuthError>) {
      state.error = action.payload;
      state.lastErrorTime = Date.now();
    },
    clearError(state) {
      state.error = null;
      state.lastErrorTime = null;
    },
    /** Быстрый сеттер из сырой ошибки (для baseQuery) */
    setErrorFromRaw(
      state,
      action: PayloadAction<{ error: unknown; httpStatus?: number }>,
    ) {
      const { error, httpStatus } = action.payload;

      // Не хранить 401 — это handled refresh flow
      if (httpStatus === 401) return;

      if (!error) return;

      const authError: AuthError = {
        type:
          httpStatus === 403
            ? AuthErrorType.email_not_confirmed
            : httpStatus === 404
              ? AuthErrorType.user_not_found
              : httpStatus === 422
                ? AuthErrorType.invalid_credentials
                : httpStatus && httpStatus >= 500
                  ? AuthErrorType.unknown
                  : AuthErrorType.unknown,
        action:
          httpStatus === 403
            ? AuthErrorAction.email_confirm
            : httpStatus === 401
              ? AuthErrorAction.reauth
              : httpStatus && httpStatus >= 500
                ? AuthErrorAction.server_error
                : AuthErrorAction.show_message,
        message:
          typeof error === 'string'
            ? error
            : typeof (error as Record<string, unknown>)?.message === 'string'
              ? ((error as Record<string, unknown>).message as string)
              : typeof (error as Record<string, unknown>)?.detail === 'string'
                ? ((error as Record<string, unknown>).detail as string)
                : 'Произошла ошибка.',
        httpStatus,
        originalError: error,
      };

      state.error = authError;
      state.lastErrorTime = Date.now();
    },
  },
});

export const { setError, clearError, setErrorFromRaw } = authErrorSlice.actions;

// Selectors
export const selectAuthError = (state: { authError: AuthErrorState }) =>
  state.authError.error;

export const selectAuthErrorMessage = (state: { authError: AuthErrorState }) =>
  state.authError.error?.message ?? null;

export const selectAuthErrorAction = (state: { authError: AuthErrorState }) =>
  state.authError.error?.action ?? null;

export const selectAuthErrorType = (state: { authError: AuthErrorState }) =>
  state.authError.error?.type ?? null;

export const selectAuthErrorHttpStatus = (state: {
  authError: AuthErrorState;
}) => state.authError.error?.httpStatus ?? null;

export const selectLastErrorTime = (state: { authError: AuthErrorState }) =>
  state.authError.lastErrorTime;

export const isEmailNotConfirmed = (state: { authError: AuthErrorState }) =>
  state.authError.error?.type === AuthErrorType.email_not_confirmed;

export default authErrorSlice.reducer;
