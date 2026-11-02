import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { PlayerList } from '@/widgets/player-list';
import { PlayersCountControl } from '@/widgets/players-count-control';
import { ToggleSwitch } from '@/shared/toggle-switch/ToggleSwitch';
import { isLatinAndDigits } from '@/components/helpers/help_functions';
import { FootprintLoader } from '../../../helpers/loader/cat_footprints';
import { getUserId } from '@/entities/user/model/slice';
import { selectAllLobbyPlayers } from '@/entities/player/model/lobbyPlayerSlice';
import {
  selectCurrentLobby,
  selectCurrentLobbyId,
  selectHostUserId,
  selectIsHostFromCurrent,
} from '@/store/slices/lobby/currentLobbySlice';

import { useLobbyPassword } from '../../../helpers/hooks/useLobbyPassword';
import { useWebSocket } from '../../../../store/contexts/WsRootProvider';
import { usePlayerAction } from '@/features/player-action-modal';
import styles from './Choose_players.module.scss';
import { PrivacyPanel } from '@/widgets/privacy-panel';
import { LockIcon } from '@/shared/ui/icons/lock';

import {
  getCensorship,
  setCensorship,
} from '../../../../features/gameSettings/index';

export const ChoosePlayers = () => {
  const { send } = useWebSocket();
  const { set: setLobbyPassword } = useLobbyPassword();
  const { openPromoteModal, openKickModal } = usePlayerAction();

  // Получаем ID текущего пользователя
  const decodedUserId = useSelector(getUserId);

  // ========== lobby
  const lobbyData = useSelector(selectCurrentLobby) || {};
  const lobbyId = useSelector(selectCurrentLobbyId);
  const maxPlayers = lobbyData?.max_players ?? lobbyData?.maxPlayers ?? 3;
  const isPrivate = Boolean(lobbyData?.is_private ?? lobbyData?.isPrivate);

  // ========== players
  const players = useSelector(selectAllLobbyPlayers) || [];
  const hostUserId = useSelector(selectHostUserId);
  const isHost = useSelector(selectIsHostFromCurrent);

  // eslint-disable-next-line no-unused-vars
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

  // Локальное состояние приватности синхронизируем с сервером
  const [isPrivateState, setIsPrivateState] = useState(isPrivate);
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const dispatch = useDispatch();
  const censorship = useSelector(getCensorship);

  // Обработчик смены цензуры (для хоста)
  const handleCensorshipToggle = nextChecked => {
    if (!isHost) return;
    dispatch(setCensorship(nextChecked));
    const censorshipSettings = { settings: { censorship: nextChecked } };
    send({ command: 'change_settings', ...censorshipSettings });
    send({ command: 'change_settings_fm', ...censorshipSettings });
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth < 576);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Синхронизация isPublic с isPrivate
  useEffect(() => {
    setIsPrivateState(isPrivate); // держим локальное состояние = серверному
    if (!isPrivate) {
      // если сервер сделал публичной — прячем поле
      setPassword('');
      setIsPasswordVisible(false);
    }
  }, [isPrivate]);

  // ВКЛ → приватно (показать поле), ВЫКЛ → публично (скрыть поле и отправить private:false)
  const handleToggleChange = nextIsPrivate => {
    if (!isHost) return;

    setIsPrivateState(nextIsPrivate);

    if (nextIsPrivate) {
      // Переходим в приватную: показываем поле пароля, отправим на сервер после нажатия кнопки
      setIsPasswordVisible(true);
    } else {
      setPassword('');
      setIsPasswordVisible(false);
      send({
        command: 'change_private',
        private: false,
        password: password,
      });
    }
  };

  // Проверка валидности пароля
  const isPasswordValid =
    password.length >= 3 && password.length <= 10 && isLatinAndDigits(password);

  const handleChangePrivate = async () => {
    if (!isHost) return;
    if (password.trim().length === 0) return;

    const privatePayload = {
      command: 'change_private',
      private: true,
      password: password,
    };

    setLobbyPassword(lobbyId, password);

    await send(privatePayload);

    setIsPrivateState(true);
    setIsPasswordVisible(false);
  };

  // Обработчики для модалок через контекст
  const handlePromoteUser = (id, username, user_id) => {
    openPromoteModal({ id, username, user_id });
  };
  const handleDeleteUser = (id, username, user_id) => {
    openKickModal({ id, username, user_id });
  };

  const handleMaxPlayersChangeValue = value => {
    send({ command: 'change_max_players', max_players: value });
  };

  if (!lobbyData) {
    return <FootprintLoader />;
  }

  return (
    <>
      <div className="col players">
        <div className="d-flex flex-column align-items-center">
          {isHost ? (
            <div className="d-flex felx-column flex-wrap justify-content-between align-items-center w-100">
              <div className="d-flex flex-row flex-nowrap justify-content-between align-items-center w-100">
                <label className="text-color-blue me-2">
                  {`Закрытая комната`}
                </label>
                <ToggleSwitch
                  id="toggle-private-choose"
                  checked={isPrivateState}
                  onChange={handleToggleChange}
                  disabled={!isHost}
                  activeThumb="#4EB5B5"
                  inactiveThumb="#223C4B"
                  activeBg="#223C4B"
                  inactiveBg="#11212A"
                  activeLabel="Вкл"
                  inactiveLabel="Выкл"
                />
              </div>
              <PrivacyPanel
                visible={isPasswordVisible}
                password={password}
                disabled={!isHost}
                isPasswordValid={isPasswordValid}
                onPasswordChange={value => {
                  let newPassword = String(value)
                    .replace(/\s/g, '')
                    .slice(0, 10);
                  setPassword(newPassword);
                }}
                onSubmit={handleChangePrivate}
                classes={{ submitButton: styles.btnSubmit }}
              />
            </div>
          ) : (
            <div
              className={`d-flex justify-content-center w-100  ${styles.headerWrap}`}
            >
              {isPrivateState && (
                <LockIcon className={styles.locker} color="#4EB5B5" size={18} />
              )}
              <div className={`text-color-blue pt-1 ${styles.label}`}>
                {isPrivateState
                  ? 'Это закрытая комната'
                  : 'Это открытая комната'}
              </div>
            </div>
          )}

          <hr className={styles.hrLine} size="5" />

          <div
            className="d-flex justify-content-center align-items-center mb-3"
            style={{ gap: 12, position: 'relative' }}
          >
            <label className="text-color-blue me-2">Цензурная версия:</label>
            <div className="reg_helper">
              <FontAwesomeIcon
                icon={faCircleInfo}
                style={{ color: '#4EB5B5' }}
              />
              <div className="reg_helper-modal">
                <ul>
                  <li>
                    Цензурная версия — все карточки без нецензурной лексики и
                    оскорблений.
                  </li>
                  <li>
                    Нецензурная версия — возможны шутки 18+ и провокационные
                    фразы.
                  </li>
                </ul>
              </div>
            </div>
            <ToggleSwitch
              id="toggle-censorship-choose"
              checked={Boolean(censorship)}
              onChange={handleCensorshipToggle}
              activeThumb="#4EB5B5"
              inactiveThumb="#223C4B"
              activeBg="#223C4B"
              inactiveBg="#11212A"
              activeLabel="Вкл"
              inactiveLabel="Выкл"
            />
          </div>

          <hr className={styles.hrLine} size="5" />
          <div className={styles.playersWrapper}>
            <PlayersCountControl
              isHost={isHost}
              playersCount={players.length}
              maxPlayers={maxPlayers}
              onChange={handleMaxPlayersChangeValue}
              options={Array.from({ length: 12 - 3 + 1 }, (_, i) => i + 3)}
              classes={{
                select: styles.formSelect,
                option: `${styles.titleWhite} ${styles.option} ${styles.playersNum}`,
                players: styles.players,
                playersNum: styles.playersNum,
              }}
            />
            <PlayerList
              players={players}
              variant="lobby"
              currentUserId={decodedUserId} // Using decodedUserId as 'me'
              hostUserId={hostUserId}
              maxPlayers={maxPlayers}
              onPromote={
                isHost
                  ? (id, username, user_id) =>
                      handlePromoteUser(id, username, user_id)
                  : undefined
              }
              onKick={
                isHost
                  ? (id, username, user_id) =>
                      handleDeleteUser(id, username, user_id)
                  : undefined
              }
              className={styles.playersList}
            />
          </div>
        </div>
      </div>
    </>
  );
};
