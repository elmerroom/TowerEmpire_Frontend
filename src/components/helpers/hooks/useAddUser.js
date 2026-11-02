import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useJoinLobbyMutation } from '../../../store/api/lobbyApi';
import { setInfoMessage } from '../../../store/slices/lobby/lobbyUiSlice';
import { handleClose } from '../help_functions';

export const useAddUser = () => {
  const [enterLobby] = useJoinLobbyMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const AddUser = useCallback(
    async ({ id, password, button }) => {
      try {
        if (!id) {
          dispatch(setInfoMessage('Введите номер комнаты.'));
          return false;
        }
        await enterLobby({
          room_id: id,
          body: { password: password ?? null },
        }).unwrap();
        navigate(`/lobby/${id}`);
        if (button) handleClose(button);
        return true;
      } catch (err) {
        const msg =
          err?.data?.detail ||
          err?.data?.message ||
          err?.message ||
          'Ошибка входа в комнату.';
        dispatch(setInfoMessage(msg));
        throw err;
      }
    },
    [enterLobby, dispatch, navigate],
  );

  return AddUser;
};
