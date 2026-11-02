import { useSelector } from 'react-redux';
import {
  getUser,
  getUserId,
  getUsername,
  getUserEmail,
  getIsAuth,
  getIsGuest,
} from './slice';
import { selectHostUserId } from '@/store/slices/lobby/currentLobbySlice';

/**
 * Hook to access user data and common auth-related checks (e.g. isHost).
 * Migrated from legacy src/entities/user/model/hooks.jsx
 */
export const useUser = () => {
  const user = useSelector(getUser);
  const hostUserId = useSelector(selectHostUserId);
  const isAuth = useSelector(getIsAuth);
  const isGuest = useSelector(getIsGuest);

  const isHost = () => {
    if (!user.user_id || !hostUserId) return false;
    return Number(user.user_id) === Number(hostUserId);
  };

  const isRegisteredUser = () => isAuth && !isGuest;

  return {
    ...user,
    userId: user.user_id,
    userEmail: user.email,
    isHost,
    isRegisteredUser,
  };
};

export default useUser;
