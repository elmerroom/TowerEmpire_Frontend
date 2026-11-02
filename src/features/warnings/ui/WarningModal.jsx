import { motion } from 'framer-motion';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { BtnIcon } from '../../../shared/ui/BtnIcon';
import { useUser } from '../../../entities/user/model/hooks';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { selectDeletedUser } from '../../../store/slices/lobby/lobbyUiSlice';
import { leaveRoomFlow } from '../../../utils/logoutFlow';
import { useWarning } from '../hooks/useWarning';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { Button } from '../../../shared/ui/Button';
import { getGameModeClass } from '@/utils/gameModeClass';

export const WarningModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useUser();
  const { warning, clearWarning } = useWarning();
  const { onConfirm, confirmText } = warning;
  const { send } = useWebSocket();
  const { title, text, redirectPath } = warning;
  const [busy, setBusy] = useState(false);

  const deletedUser = useSelector(selectDeletedUser);
  const isDeleted = deletedUser && Number(deletedUser.id) === Number(userId);

  const gameMode = useSelector(state => state.modal.gameMode);
  const isGame = !!gameMode;
  const modalClass = getGameModeClass(gameMode, 'modal');
  const btnClass = getGameModeClass(gameMode, 'btn');

  const isWaitingForGameModal = [
    'Необходимо дождаться следующего раунда',
    'Добро пожаловать! Ожидаем старта игры.',
  ].includes(text);

  const is422Modal = [
    'Ты хост. Нажми «Начать игру», чтобы запустить раунд.',
    'Добро пожаловать! Ожидаем старта игры.',
  ].includes(text);

  const show = Boolean(title) && !isDeleted;
  if (!show) return null;

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    clearWarning();

    try {
      if (typeof onConfirm === 'function') {
        await onConfirm();
      }
    } catch (error) {
      console.warn('[WarningModal] onConfirm error:', error);
    }

    if (!redirectPath) {
      clearWarning();
      setBusy(false);
      return;
    }

    if (redirectPath === '/') {
      try {
        const deleteUserId =
          deletedUser && deletedUser.id != null ? Number(deletedUser.id) : null;
        if (deleteUserId != null) {
          await send({ command: 'delete_user', delete_user: deleteUserId });
        }
      } catch (error) {
        console.warn('[exit] WS not open, skip WS message', error);
      } finally {
        leaveRoomFlow({ dispatch, navigate });
      }
      setBusy(false);
      return;
    }

    if (redirectPath.startsWith('/lobby')) {
      sessionStorage.removeItem('currentGameId');
      setBusy(false);
      navigate(redirectPath, { replace: true });
      setBusy(false);
      return;
    }
    navigate(redirectPath);
    setBusy(false);
  };
  const isSafari =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  return (
    <UniversalModal
      isOpen={show}
      onClose={handleConfirm}
      closeable={false}
      showCloseButton={false}
      portalTarget={isGame ? '#game-modal-root' : 'body'}
      className={`${isGame ? `${modalClass}` : ''} ${is422Modal ? 'modal-w-422' : ''} no-select`}
    >
      <div className="border-0">
        <h1 className="my-modal-title title-white mx-auto">{title}</h1>
      </div>

      <div className="mx-auto">
        <ModalSVG />
      </div>

      <div>
        <motion.div
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {text}
        </motion.div>
        {isWaitingForGameModal && (
          <motion.div
            className="d-flex justify-content-center mt-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <video
              autoPlay
              loop
              muted
              width="150"
              height="150"
              style={{ borderRadius: '8px', marginLeft: '15px' }}
            >
              {isSafari ? (
                <source
                  src="/video/cat-sphere.mov"
                  type='video/mp4; codecs="hvc1"'
                />
              ) : (
                <source src="/video/cat-sphere.webm" type="video/webm" />
              )}
            </video>
          </motion.div>
        )}
      </div>

      {!isWaitingForGameModal && (
        <div className="border-0 d-flex justify-content-center mt-3">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button
              variant={isGame ? 'confirm' : 'submit'}
              theme={
                gameMode === 'fuflomicin'
                  ? 'fufl'
                  : gameMode
                    ? 'game'
                    : 'default'
              }
              onClick={handleConfirm}
            >
              {confirmText || (redirectPath ? 'Принять' : 'Ок')}{' '}
              <BtnIcon src="/img/YES.svg" />
            </Button>
          </motion.div>
        </div>
      )}
    </UniversalModal>
  );
};
