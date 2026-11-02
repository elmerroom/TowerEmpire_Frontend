import styles from './modal_waiting_for_players.module.scss';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '../../../../entities/user/model/hooks';
import { closeModal, openModal } from '../../../../store/modalSlice';
import { WaitingTimer } from '@/components/waitingTimer/waitingTimer';
import { useWebSocket } from '../../../../store/contexts/WsRootProvider';
import { ModalSVG } from '../../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../../shared/universal-modal/UniversalModal';
import { InviteLink } from '@/features/invite-link-block/InviteLink';
import { selectCurrentLobbyId } from '@/store/slices/lobby/currentLobbySlice';
import { Button } from '../../../../shared/ui/Button';
import { getGameModeClass } from '@/utils/gameModeClass';
import { selectWaitingForPlayersEndTimestamp } from '@/entities/player/model/gamePlayerSlice';
import { selectIsKicked } from '@/store/slices';
import { ExitIcon } from '@/shared/ui/icons/exit';

export const ModalWaitingForPlayers = () => {
  const dispatch = useDispatch();
  const { isHost } = useUser();
  const { send } = useWebSocket();

  const lobbyId = useSelector(selectCurrentLobbyId);
  const endTimestamp = useSelector(selectWaitingForPlayersEndTimestamp);
  const isKicked = useSelector(selectIsKicked);
  const isOpen =
    useSelector(state => !!state.modal.openModals['modalWaitingForPlayers']) &&
    !isKicked;
  const gameMode = useSelector(state => state.modal.gameMode);
  const modalClass = getGameModeClass(gameMode, 'modal');
  const theme = getGameModeClass(gameMode, 'theme');

  useEffect(() => {
    return () => dispatch(closeModal('modalWaitingForPlayers'));
  }, [dispatch]);

  const handleFinishEarly = async () => {
    handleClose();
    sessionStorage.removeItem('currentGameId');
    sessionStorage.removeItem('currentGameType');
    try {
      await send({ command: 'finish_game_early' });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  const handleClose = () => dispatch(closeModal('modalWaitingForPlayers'));

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={() => {}}
      showCloseButton={false}
      closeable={false}
      portalTarget="#game-modal-root"
      className={`modal-w-480 ${modalClass}`}
      data-game-mode={gameMode}
    >
      <h1 className="my-modal-title title-white mx-auto">Ожидание игроков</h1>
      <WaitingTimer endTimestamp={endTimestamp} />
      <ModalSVG />
      {!isHost() && (
        <div className="error-message">
          Недостаточно игроков для продолжения игры. <br /> Подождите, пока
          присоединятся новые участники.
        </div>
      )}
      {isHost() && (
        <>
          <div className="error-message">
            Недостаточно игроков для продолжения игры.
            <br /> Подождите, пока присоединятся новые участники, или завершите
            игру досрочно.
          </div>

          <div className={styles.waitingModalActions}>
            <InviteLink lobbyId={lobbyId} theme={theme} />

            <div className="modal-buttons">
              <Button
                variant="confirm"
                theme={theme}
                onClick={handleFinishEarly}
                className="w-100 d-flex justify-content-center align-items-center gap-2"
              >
                <ExitIcon
                  className={styles.exitIcon}
                  color="var(--button-text-color)"
                />
                Досрочно завершить игру
              </Button>
            </div>
          </div>
        </>
      )}
    </UniversalModal>
  );
};
