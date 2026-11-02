import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openModal } from '../store/modalSlice';
import { setInfoMessage } from '../store/slices/lobby/lobbyUiSlice';

export const EmailConfirmedPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const errorMessages = {
      token_invalid: 'Ссылка недействительна или срок её действия истёк',
      already_active: 'E-mail уже подтверждён',
      user_not_found: 'Пользователь не найден',
    };
    const errorMessage = errorMessages[error];
    dispatch(
      setInfoMessage(
        errorMessage
          ? { isSuccess: false, message: errorMessage }
          : { isSuccess: true, message: 'E-mail подтверждён' },
      ),
    );
    dispatch(openModal('info-modal'));
    navigate('/lobby', { replace: true });
  }, []);

  return null;
};
