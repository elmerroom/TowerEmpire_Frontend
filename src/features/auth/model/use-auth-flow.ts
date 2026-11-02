import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLoginMutation,
  useRefreshMutation,
  useTempRegistrationMutation,
  useGetTempTokenMutation,
} from '../../../store/api/authApi';
import {
  LoginRequest,
  LoginTempRequest,
  TokenResponse,
} from '../../../store/api/types';
import { useLazyGetPersonalAreaQuery } from '../../../entities/user/api/user-api';
import {
  setTokens,
  setAuth,
  setUser,
  clearUser,
  getIsAuth,
  getIsGuest,
} from '@/entities/user/model/slice';
import { clearError } from '../../../store/slices/authErrorSlice';

export function useAuthFlow() {
  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [tempRegistration] = useTempRegistrationMutation();
  const [refresh, { isLoading: isRefreshLoading }] = useRefreshMutation();
  const [getTempToken] = useGetTempTokenMutation();
  const [getPersonalArea, { isLoading: isGetCredentialsLoading }] =
    useLazyGetPersonalAreaQuery();

  const isAuth = useSelector(getIsAuth);
  const isGuest = useSelector(getIsGuest);
  const isReAuthLoading =
    isRefreshLoading || isGetCredentialsLoading || isLoginLoading;

  const signIn = useCallback(
    async (creds: any) => {
      let result;
      let guest = false;
      if (creds.email && creds.password) {
        const loginResponse = await login({
          email: creds.email,
          password: creds.password,
        }).unwrap();
        result = loginResponse;
        sessionStorage.removeItem('isGuest');
      } else if (creds.username) {
        guest = true;
        try {
          await tempRegistration({
            username: creds.username,
          }).unwrap();
        } catch (e: any) {
          if (e?.status === 400) {
            throw new Error(
              'Данное имя уже занято. Пожалуйста, выберите другое.',
            );
          }
          throw e;
        }
        const uname = creds.username;

        let tokenPair;
        try {
          tokenPair = await getTempToken({ username: uname }).unwrap();
        } catch {
          await new Promise(r => setTimeout(r, 200));
          tokenPair = await getTempToken({ username: uname }).unwrap();
        }
        result = tokenPair;
        sessionStorage.setItem('isGuest', 'true');
      } else {
        throw new Error('Неверные учетные данные');
      }

      if (!result) {
        throw new Error('Сервер не вернул токены авторизации');
      }

      const { access, refresh: ref } = result as TokenResponse;
      if (!access) {
        throw new Error(
          'Токен доступа (access token) отсутствует в ответе сервера',
        );
      }

      dispatch(clearError());
      dispatch(setTokens({ access, refresh: ref }));
      if (ref) {
        sessionStorage.setItem('refreshToken', ref);
      }

      let userId;
      try {
        const payload = JSON.parse(atob(access?.split('.')[1] || ''));
        userId = payload.user_id ?? payload.id;
      } catch {
        throw new Error('Не удалось извлечь userId из токена');
      }
      if (!userId) {
        throw new Error('userId не найден в токене');
      }

      const profile = await getPersonalArea().unwrap();

      dispatch(
        setUser({
          user_id: userId,
          username: profile.username,
          email: profile.email ?? null,
          date_joined: profile.date_joined ?? null,
          avatar: profile.avatar,
          isGuest: guest,
          nickname_color: profile.nickname_color,
          exp: profile.exp,
          is_vip: profile.is_vip,
          achievements: profile.achievements,
          statistics: profile.statistics,
        }),
      );
      dispatch(setAuth(true));

      return true;
    },
    [dispatch, getPersonalArea, getTempToken, login, tempRegistration],
  );

  const reAuth = useCallback(async () => {
    const ref = sessionStorage.getItem('refreshToken');
    const isGuestSession = sessionStorage.getItem('isGuest') === 'true';
    if (!ref || isAuth) return false;

    try {
      const result = await refresh({ refresh: ref }).unwrap();
      if (!result || !result.access) {
        throw new Error('Не удалось получить новый токен доступа');
      }
      const { access } = result;

      dispatch(setTokens({ access }));

      const payload = JSON.parse(atob(access?.split('.')[1] || ''));
      const userId = payload.user_id ?? payload.id;

      const profile = await getPersonalArea().unwrap();

      dispatch(
        setUser({
          user_id: userId,
          username: profile.username,
          email: profile.email ?? null,
          date_joined: profile.date_joined ?? null,
          avatar: profile.avatar,
          isGuest: isGuestSession,
          nickname_color: profile.nickname_color,
          exp: profile.exp,
          is_vip: profile.is_vip,
          achievements: profile.achievements,
          statistics: profile.statistics,
        }),
      );
      dispatch(setAuth(true));

      return true;
    } catch (error) {
      if (
        (error as any)?.status === 401 &&
        (error as any)?.data?.code === 'user_not_found'
      ) {
        console.warn('reAuth: пользователь не найден, очищаем сессию');
      } else {
        console.error('reAuth: ошибка при восстановлении сессии', error);
      }
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('isGuest');
      dispatch(clearUser());
      dispatch(setAuth(false));
      return false;
    }
  }, [isAuth, refresh, dispatch, getPersonalArea]);

  const signOut = useCallback(() => {
    sessionStorage.removeItem('isGuest');
    dispatch(clearUser());
  }, [dispatch]);

  return {
    signIn,
    reAuth,
    signOut,
    isAuth,
    isLoginLoading,
    isReAuthLoading,
    isGuest,
  };
}
