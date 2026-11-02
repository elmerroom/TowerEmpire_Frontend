import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLoginMutation,
  useRefreshMutation,
} from '../../../store/api/authApi';
import {
  setTokens,
  setUser,
  setAuth,
  clearUser,
} from '../../../store/userSlice';

export const useGetTokens = () => {
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [refresh] = useRefreshMutation();
  const isAuth = useSelector(state => state.user.isAuth);

  const signIn = useCallback(
    async ({ email, password }) => {
      const result = await login({ email, password }).unwrap();
      const { access, refresh: ref, user } = result;
      dispatch(setTokens({ access, refresh: ref }));
      dispatch(setUser(user));
      dispatch(setAuth(true));
      sessionStorage.setItem('refreshToken', ref);
    },
    [login, dispatch],
  );

  const reAuth = useCallback(async () => {
    try {
      const result = await refresh().unwrap();
      const { access, refresh: ref, user } = result;
      dispatch(setTokens({ access, refresh: ref }));
      dispatch(setUser(user));
      dispatch(setAuth(true));
      sessionStorage.setItem('refreshToken', ref);
    } catch {
      dispatch(clearUser());
      sessionStorage.removeItem('refreshToken');
    }
  }, [refresh, dispatch]);

  const signOut = useCallback(() => {
    dispatch(clearUser());
    sessionStorage.removeItem('refreshToken');
  }, [dispatch]);

  return { signIn, reAuth, signOut, isAuth };
};
