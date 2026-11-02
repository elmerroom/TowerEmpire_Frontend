import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  BaseQueryApi,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { clearUser, setAuth, setTokens } from '@/entities/user/model/slice';
import { setInfoMessage } from '../../store/slices/lobby/lobbyUiSlice';
import { setErrorFromRaw } from '../../store/slices/authErrorSlice';
import { apiBase, USERS } from '../config/endpoints';
import {
  refreshResponseSchema,
  refreshTokenPayloadSchema,
  validateApiResponse,
} from '@/shared/lib/validation/api';

type NormalizedError = {
  status: number;
  code?: string;
  message: string;
};

type QueryArgs = string | FetchArgs;

type CustomBaseQuery = BaseQueryFn<QueryArgs, unknown, NormalizedError>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toAbsoluteUrl = (url: string): string => {
  const normalizedBase = apiBase.replace(/\/+$/, '');
  const normalizedPath = url.replace(/^\/+/, '');
  return url.startsWith('http') ? url : `${normalizedBase}/${normalizedPath}`;
};

const lobbyBaseUrl = `${apiBase.replace(/\/+$/, '')}/lobby/`;

const extractDetailMessage = (data: unknown): string | undefined => {
  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    const collected = data
      .map(item =>
        isObject(item) && typeof item.msg === 'string' ? item.msg : undefined,
      )
      .filter((msg): msg is string => Boolean(msg));

    if (collected.length > 0) {
      return collected.join(', ');
    }
  }

  if (isObject(data)) {
    const messageCandidate = data.message ?? data.msg ?? data.detail;
    if (typeof messageCandidate === 'string') {
      return messageCandidate;
    }

    if (Array.isArray(messageCandidate)) {
      const nested = messageCandidate
        .map(item =>
          isObject(item) && typeof item.msg === 'string' ? item.msg : undefined,
        )
        .filter((msg): msg is string => Boolean(msg));
      if (nested.length > 0) {
        return nested.join(', ');
      }
    }
  }

  return undefined;
};

const extractFastApiMessage = (
  error: FetchBaseQueryError,
): string | undefined => {
  if ('data' in error) {
    const data = error.data;
    if (isObject(data)) {
      const detail = data.detail ?? data.message;
      return extractDetailMessage(detail ?? data);
    }

    return extractDetailMessage(data);
  }

  if ('error' in error && typeof error.error === 'string') {
    return error.error;
  }

  return undefined;
};

const createNormalizedError = (
  error: FetchBaseQueryError,
  requestUrl: string | undefined,
): NormalizedError => {
  const status = typeof error.status === 'number' ? error.status : 0;

  if (status === 401) {
    return {
      status,
      message: 'Сессия истекла. Пожалуйста, войдите снова.',
    };
  }

  if (status === 403) {
    return {
      status,
      message: 'Доступ запрещен.',
    };
  }

  if (status === 404 && requestUrl && requestUrl.startsWith(lobbyBaseUrl)) {
    return {
      status,
      code: 'ROOM_NOT_FOUND',
      message: 'Комната удалена или не существует.',
    };
  }

  if (status >= 500 && status < 600) {
    return {
      status,
      message: 'Ошибка сервера. Пожалуйста, попробуйте позже.',
    };
  }

  const fallback = extractFastApiMessage(error) ?? 'Что-то пошло не так';

  return {
    status: status || 0,
    message: fallback,
  };
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${apiBase}`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { user?: { accessToken?: string } };
    const token = state.user?.accessToken;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const clearSession = (api: BaseQueryApi): void => {
  sessionStorage.removeItem('refreshToken');
  api.dispatch(clearUser());
  api.dispatch(setAuth(false));
};

const refreshTokens = async (
  refreshToken: string,
  api: BaseQueryApi,
): Promise<boolean> => {
  try {
    const response = await fetch(USERS.tokenRefresh, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = validateApiResponse(
      refreshTokenPayloadSchema,
      await response.json(),
      'auth/refresh',
    );

    api.dispatch(
      setTokens({
        access: data.access,
      }),
    );
    api.dispatch(setAuth(true));

    if (data.refresh) {
      sessionStorage.setItem('refreshToken', data.refresh);
    }

    return true;
  } catch (error) {
    console.error('Не удалось обновить токен доступа:', error);
    return false;
  }
};

const getRequestUrl = (args: QueryArgs): string | undefined => {
  const url = typeof args === 'string' ? args : args?.url;
  return typeof url === 'string' ? toAbsoluteUrl(url) : undefined;
};

export const baseQueryWithReauth: CustomBaseQuery = async (
  args,
  api,
  extraOptions,
) => {
  const requestUrl = getRequestUrl(args);

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = sessionStorage.getItem('refreshToken');

    if (refreshToken) {
      const refreshed = await refreshTokens(refreshToken, api);

      if (refreshed) {
        result = await baseQuery(args, api, extraOptions);
      } else {
        clearSession(api);
      }
    } else {
      clearSession(api);
    }
  }

  if (result.error) {
    const normalizedError = createNormalizedError(result.error, requestUrl);

    if (normalizedError.code === 'ROOM_NOT_FOUND') {
      api.dispatch(
        setInfoMessage({ isSuccess: false, message: normalizedError.message }),
      );
    }

    // Dispatch auth error to Redux state (except 401 — handled by refresh flow)
    const status = normalizedError.status;
    if (status !== 401) {
      api.dispatch(
        setErrorFromRaw({
          error: result.error,
          httpStatus: status || undefined,
        }),
      );
    }

    return { error: normalizedError };
  }

  return result;
};
