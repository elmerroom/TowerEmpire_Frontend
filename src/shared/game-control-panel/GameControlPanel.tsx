import { useDispatch, useSelector } from 'react-redux';
import { setModalContent, openModal } from '@/store/modalSlice';
import styles from './GameControlPanel.module.scss';
import { Button } from '@/shared/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { getGamePhase } from '@/store/fuflomicin/fuflSlice';
import { selectPhase } from '@/entities/game';
import { useInviteLink } from '@/components/helpers/hooks/useInviteLink';

export interface GameControlPanelProps {
  isHost: boolean;
  gameStatus: 'running' | 'paused' | 'idle' | 'PAUSE' | 'RESUME';
  gameId: number | null;
  gameName: string;
  lobbyId: string | number | null;
  onShowRules: () => void;
  onPlay: (command: 'pause', game_name: string) => void;
  onShowSettings: () => void;
  onShowExit: (isHost: boolean) => void;
  theme?: 'dark' | 'fufl';
}

export const GameControlPanel = ({
  isHost,
  gameStatus,
  gameId,
  gameName,
  lobbyId,
  onShowRules,
  onPlay,
  onShowSettings,
  onShowExit,
  theme = 'dark',
}: GameControlPanelProps) => {
  const isFufl = theme === 'fufl';
  const dispatch = useDispatch();
  const { isCopied, copyInviteLink } = useInviteLink(lobbyId);
  let PAUSE_ALLOWED_PHASES;
  let gamePhase;

  if (gameName === 'Black Jokes') {
    PAUSE_ALLOWED_PHASES = ['player_choice', 'master_choice'];
    gamePhase = useSelector(selectPhase);
  } else {
    PAUSE_ALLOWED_PHASES = ['PLAYER_SUBMISSION', 'REVEAL_SUBMISSIONS'];
    gamePhase = useSelector(getGamePhase);
  }

  const handleTogglePause = () => {
    if (gameId === null) return;
    onPlay('pause', gameName);
  };

  const handleShowSettings = () => {
    dispatch(setModalContent({ title: 'настройки' }));
    onShowSettings();
  };

  const handleShowExit = () => {
    dispatch(setModalContent({ title: 'Выход из игры', host: isHost }));
    onShowExit(isHost);
  };

  return (
    <div className={`game-settings ${isFufl ? 'game-settings_fufl' : ''}`}>
      {isHost && (
        <>
          <Button
            className="btn-svg"
            onClick={copyInviteLink}
            title="Пригласить игроков"
          >
            <svg
              style={{
                height: '20px',
                width: '20px',
                color: isFufl ? undefined : 'white',
              }}
            >
              <use href={isFufl ? '#invite' : '#inviteWhite'}></use>
            </svg>
          </Button>
          <div
            className={`${styles.copyNotification} ${isCopied ? styles.visible : ''}`}
          >
            Ссылка-приглашение скопирована
          </div>
        </>
      )}
      <Button
        className="btn-svg"
        onClick={() => {
          handleShowSettings();
          dispatch(openModal('GameSettings'));
        }}
      >
        <svg style={{ height: '20px', width: '20px' }}>
          <use href={isFufl ? '#settings_fufl' : '#settings'}></use>
        </svg>
      </Button>

      <Button
        className={`btn-svg ${styles['btn-pause']}`}
        type="button"
        onClick={handleTogglePause}
        disabled={!PAUSE_ALLOWED_PHASES.includes(gamePhase)}
      >
        <svg style={{ height: '16px', width: '14px' }} className="svg-active">
          <use
            href={
              gameStatus === 'paused'
                ? isFufl
                  ? '#play_fufl'
                  : '#play'
                : isFufl
                  ? '#pause_fufl'
                  : '#pause'
            }
          />
        </svg>
      </Button>

      <Button
        className="btn-svg"
        onClick={() => {
          handleShowExit();
          dispatch(openModal('modalKickPlayer'));
        }}
      >
        <svg style={{ width: '20px', height: '20px' }}>
          <use xlinkHref={isFufl ? '#exit_fufl' : '#exit'}></use>
        </svg>
      </Button>
      <Button className="btn-svg" onClick={onShowRules}>
        <FontAwesomeIcon
          icon={faCircleInfo}
          className={isFufl ? styles.infoIconFufl : undefined}
          style={{ height: '18px', width: '18px' }}
        />
      </Button>
    </div>
  );
};
