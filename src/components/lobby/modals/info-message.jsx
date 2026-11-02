import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { selectLobbyInfoMessage } from '../../../store/slices/lobby/lobbyUiSlice';
import { logoutFlow } from '../../../utils/logoutFlow';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { closeModal } from '../../../store/modalSlice';

export const ModalInfo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const info = useSelector(selectLobbyInfoMessage);
  const isRegistered = useSelector(state => state.user.email);

  const isOpen = useSelector(state => !!state.modal.openModals['info-modal']);

  const handleClose = () => {
    dispatch(closeModal('info-modal'));
    logoutFlow({ isRegisteredUser: isRegistered, dispatch, navigate });
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="body"
    >
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="my-modal-title title-white">
          {info.isSuccess ? 'Поздравляем' : 'Упс, ошибка'}
        </h1>
      </div>
      <ModalSVG></ModalSVG>
      <div className="error-message">{info.message}</div>
    </UniversalModal>
  );
};
