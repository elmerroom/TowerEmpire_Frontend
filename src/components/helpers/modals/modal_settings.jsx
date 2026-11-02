import { useSelector, useDispatch } from 'react-redux';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import useUser from '../../../entities/user/model/hooks';
import { GameSettingsForm } from '../../../features/gameSettings';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { closeModal } from '../../../store/modalSlice';
import { getGameModeClass } from '@/utils/gameModeClass';

export const ModalSettings = ({ gameType = 'bj' }) => {
  const { isHost } = useUser();
  const { send } = useWebSocket();
  const dispatch = useDispatch();
  const isOpen = useSelector(state => !!state.modal.openModals['GameSettings']);
  const gameMode = useSelector(state => state.modal.gameMode);
  const modalClass = getGameModeClass(gameMode, 'modal');
  const settingsTheme = getGameModeClass(gameMode, 'theme');

  const handleClose = () => dispatch(closeModal('GameSettings'));

  const handleSubmitSettings = settings => {
    const settingsPayload = {
      command:
        gameType === 'fuflomicin' ? 'change_settings_fm' : 'change_settings',
      settings: {
        victory_points: settings.scoreToWin,
        censorship: settings.censorship,
        player_round_second: settings.roundTime,
      },
    };
    send(settingsPayload);
    handleClose();
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="#game-modal-root"
      className={modalClass}
    >
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="my-modal-title title-white mx-auto">настройки</h1>
      </div>
      <ModalSVG />
      <GameSettingsForm
        isHost={isHost()}
        onSubmit={handleSubmitSettings}
        theme={settingsTheme}
      />
    </UniversalModal>
  );
};
