import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useDeleteUserAccountMutation } from '../api/deleteAccountApi';
import { clearUser, setAuth } from '../../../entities/user/model/slice';
import { useUser } from '../../../entities/user/model/hooks';

export const useDeleteAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [deleteAccountMutation] = useDeleteUserAccountMutation();
  const { isRegisteredUser } = useUser();

  const deleteBackdrops = () => {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(element => element.remove());
  };

  const deleteAccount = async () => {
    try {
      if (isRegisteredUser()) {
        await deleteAccountMutation().unwrap();
        sessionStorage.removeItem('refreshToken');
        dispatch(clearUser());
        dispatch(setAuth(false));
        deleteBackdrops();
        navigate('/');
      } else {
        dispatch(setAuth(false));
        deleteBackdrops();
        navigate('/');
      }
    } catch (error) {
      console.error('Ошибка удаления аккаунта:', error);
    }
  };

  return { deleteAccount };
};
