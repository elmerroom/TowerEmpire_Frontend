import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../../entities/user/model/hooks';
import { GameSettingsForm } from '../../../features/gameSettings/ui/GameSettingsForm';
import {
  clearChats,
  selectDeletedUser,
} from '../../../store/slices/lobby/lobbyUiSlice';
import { reset } from '../../../store/slices/players/playersSlice';
import { clearModal, closeModal, openModal } from '../../../store/modalSlice';
import { clearUser, setAuth } from '../../../entities/user/model/slice';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { AvatarLetter } from '../help_functions';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { Button } from '../../../shared/ui/Button';
import { useInteraction } from '@/features/interaction-orchestrator';
import { getGameModeClass } from '@/utils/gameModeClass';
import { reset as resetGamePlayers } from '@/entities/player/model/gamePlayerSlice';

const ICON_MAP = {
  Да: '/img/YES.svg',
  Нет: '/img/NO.svg',
  'К выбору игры': '/img/ExitDoor.svg',
};

const btnIcon = text => {
  const src = ICON_MAP[text];
  if (!src) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 18,
        height: 18,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        marginLeft: 12,
        flexShrink: 0,
        borderRadius: 0,
      }}
    />
  );
};

export const ModalKick = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { isHost, isRegisteredUser } = useUser();
  const { send } = useWebSocket();
  const { registerLegacyModal, startInteraction } = useInteraction();
  const isOpen = useSelector(
    state => !!state.modal.openModals['modalKickPlayer'],
  );
  const gameMode = useSelector(state => state.modal.gameMode);
  const modalClass = getGameModeClass(gameMode, 'modal');

  useEffect(() => {
    return () => dispatch(clearModal());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return registerLegacyModal(
      'legacy-modal-kick-player',
      () => dispatch(openModal('modalKickPlayer')),
      () => dispatch(closeModal('modalKickPlayer')),
    );
  }, [dispatch, registerLegacyModal]);

  const {
    title,
    text,
    colorText,
    confirm,
    results,
    primaryBtn,
    secondaryBtn,
    thirdBtn,
    showButtons,
  } = useSelector(state => state.modal);
  const widthClass = title === 'Выход из игры' ? 'modal-w-590' : '';
  const deletedUser = useSelector(selectDeletedUser);

  const handleClose = () => dispatch(closeModal('modalKickPlayer'));

  const handleSubmitSettings = async settings => {
    const settingsPayload = {
      command: 'change_settings',
      settings: {
        victory_points: settings.scoreToWin,
        player_round_second: settings.roundTime,
        censorship: settings.censorship,
      },
    };
    await send(settingsPayload);
    if (settings.theme === 'game') {
      const privatePayload = {
        command: 'change_private',
        private: settings.isPrivate,
        password: settings.isPrivate ? settings.password : '',
      };
      await send(privatePayload);
    }
  };

  const handleExit = async () => {
    handleClose();
    sessionStorage.removeItem('currentGameId');
    sessionStorage.removeItem('currentGameType');
    if (!isRegisteredUser()) {
      dispatch(setAuth(false));
      dispatch(clearUser());
    }
    dispatch(reset());
    dispatch(clearChats());
    try {
      await send({ command: 'delete_user_from' });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      navigate('/lobby', { replace: true });
      dispatch(resetGamePlayers());
    }
  };

  const handleExitAll = () => {
    handleClose();
    sessionStorage.removeItem('currentGameId');
    sessionStorage.removeItem('currentGameType');
    send({ command: 'exit_from_all' });
  };

  const handleExitToLobby = async () => {
    handleClose();
    sessionStorage.removeItem('currentGameId');
    sessionStorage.removeItem('currentGameType');
    try {
      await send({ command: 'exit_all_from_game' });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      navigate(`/lobby/${id}`, { state: { noAutoReconnect: true } });
    }
  };

  const handleDeletePlayer = () => {
    if (isHost() && deletedUser.id) {
      const interactionId = startInteraction('legacy-kick-player', {
        payload: { targetPlayerId: Number(deletedUser.id) },
        expectedEvents: ['user_kick'],
      });
      send({
        command: 'delete_user',
        delete_player: Number(deletedUser.id),
        interactionId,
      });
    } else {
      alert('Ошибка: ID игрока отсутствует.');
    }
    handleClose();
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      closeable
      portalTarget="#game-modal-root"
      className={`${modalClass} ${widthClass}`}
    >
      <h1 className="my-modal-title title-white mx-auto">{title}</h1>
      <ModalSVG />
      {title === 'настройки' ? (
        <GameSettingsForm
          isHost={isHost()}
          onSubmit={handleSubmitSettings}
          theme={
            gameMode === 'fuflomicin'
              ? 'fufl'
              : gameMode === 'hff'
                ? 'hff'
                : 'game'
          }
        />
      ) : title === 'Выход из игры' ? (
        <div className="modal-game__text">
          <p>{text}</p>
          <p className="colored-text">{colorText}</p>
        </div>
      ) : (
        <div className="modal-game__text">
          <p>{text}</p>
          <p className="colored-text">{colorText}</p>
          <p>{confirm}</p>
          {title === 'результаты игры' && (
            <div className="modal-game__results">
              <ul className="modal-game__results-list">
                {results.map((result, index) => (
                  <li
                    key={index}
                    className="d-flex justify-content-between align-items-center gap-1 modal-game__result-item"
                  >
                    <div className="d-flex justify-content-start align-items-center gap-3">
                      <p
                        style={
                          result.name === 'Wendia' ? { color: '#FFB546' } : {}
                        }
                        className="place"
                      >
                        {index === 0 ? (
                          <img
                            src="/img/trophy.svg"
                            alt=""
                            width="35"
                            height="30"
                          />
                        ) : (
                          `${index + 1}.`
                        )}
                      </p>
                      {index <= 2 && (
                        <div className="d-flex justify-content-center align-items-center modal-game__result-item_avatar">
                          <p>{AvatarLetter(result.name)}</p>
                        </div>
                      )}
                      <p
                        style={
                          result.name === 'Wendia' ? { color: '#FFB546' } : {}
                        }
                      >
                        {result.name}
                      </p>
                    </div>
                    <p
                      className="score"
                      style={
                        result.name === 'Wendia' ? { color: '#FFB546' } : {}
                      }
                    >
                      {result.score}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {title === 'Выход из игры' && (
        <img
          src="/img/cat-leave.gif"
          alt="crying cat"
          width={150}
          style={thirdBtn ? { order: 1 } : {}}
        />
      )}
      {showButtons && (
        <div
          className={`modal-buttons ${title === 'настройки' ? 'flex-column' : ''}`}
        >
          {secondaryBtn && title !== 'настройки' && (
            <Button
              variant="outline"
              theme={
                gameMode === 'fuflomicin'
                  ? 'fufl'
                  : gameMode === 'hff'
                    ? 'hff'
                    : 'game'
              }
              onClick={() => {
                if (title === 'Выход из игры' && isHost()) {
                  handleExitToLobby();
                } else {
                  handleClose();
                }
              }}
              style={thirdBtn ? { padding: '5px 14px' } : {}}
            >
              {secondaryBtn}
              {btnIcon(secondaryBtn)}
            </Button>
          )}
          {title !== 'настройки' && (
            <Button
              variant="confirm"
              theme={
                gameMode === 'fuflomicin'
                  ? 'fufl'
                  : gameMode === 'hff'
                    ? 'hff'
                    : 'game'
              }
              onClick={
                title === 'удаление игрока' ? handleDeletePlayer : handleExit
              }
            >
              {primaryBtn}
              {btnIcon(primaryBtn)}
            </Button>
          )}
          {thirdBtn && title !== 'настройки' && (
            <Button
              variant="outline"
              theme={
                gameMode === 'fuflomicin'
                  ? 'fufl'
                  : gameMode === 'hff'
                    ? 'hff'
                    : 'game'
              }
              onClick={handleExitAll}
              style={
                thirdBtn
                  ? {
                      padding: '5px 14px',
                      background:
                        gameMode === 'fuflomicin' ? '#a89879' : undefined,
                      borderColor:
                        gameMode === 'fuflomicin' ? '#a89879' : undefined,
                    }
                  : {}
              }
            >
              {thirdBtn}
              {btnIcon(thirdBtn)}
            </Button>
          )}
        </div>
      )}
    </UniversalModal>
  );
};
