import React, { useState } from 'react';
import styles from './player.module.scss';
import { CrownIcon } from '@/shared/ui/icons/crown';
import { Button } from '@/shared/ui/Button';
import PlayerPopup from './player-popup/PlayerPopup';
import { BotAvatar } from '@/shared/ui/icons/botAvatar';

export type PlayerCardProps = {
  username: string;
  avatar?: string | null;
  nicknameColor?: string;
  theme?: 'default' | 'bj' | 'fufl'; // Расширено для baccarat theme
  variant?: 'lobby' | 'game';
  loading?: boolean; // НОВОЕ: для контроля скелетона

  // Flags
  isHostMark?: boolean;
  isOffline?: boolean;
  isCurrent?: boolean;
  isMaster?: boolean;
  isBot?: boolean;
  isVip?: boolean;
  isDisconnect?: boolean;
  isGuest?: boolean;

  // Logic props
  score?: number;
  rank?: number;
  rankName?: string;
  exp?: number;

  // Controls
  onKick?: () => void;
  onPromote?: () => void;
  showControls?: boolean;
  crownDisabled?: boolean;

  // Misc
  className?: string;
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  username,
  avatar,
  nicknameColor,
  theme = 'default',
  isHostMark,
  isOffline,
  isCurrent,
  isBot,
  isVip,
  isDisconnect,
  isGuest,
  variant = 'lobby',
  onKick,
  onPromote,
  showControls,
  className = '',
  crownDisabled,
  // Game props ignore for lobby logic
  isMaster,
  rank,
  rankName,
  score,
  exp,
  loading,
}) => {
  // Popup state
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div
        className={`
        ${styles.skeletonContainer}
        ${variant === 'lobby' ? styles.skeletonLobby : styles.skeletonGame}
        ${theme === 'fufl' ? styles.skeletonFufl : ''}
        ${theme === 'bj' ? styles.skeletonBaccarat : ''}
      `}
      >
        <div className={styles.skeletonBackground}></div>
        <div className={styles.skeletonOverlay}></div>
      </div>
    );
  }

  // --- POPUP RENDERER ---
  const renderPopup = () => {
    if (!popupVisible) return null;
    return (
      <PlayerPopup
        username={username}
        avatar={avatar}
        rank={rankName ?? rank}
        xp={exp ?? (variant === 'lobby' ? score : 0)}
        position={popupPos}
        onClose={() => setPopupVisible(false)}
        isBot={isBot}
        isVip={isVip}
        isDisconnect={isDisconnect ?? isOffline}
        isGuest={isGuest}
        isHost={isHostMark}
        nicknameColor={nicknameColor}
      />
    );
  };

  // --- LOBBY VARIANT ---
  if (variant === 'lobby') {
    return (
      <>
        <div
          className={`
          ${styles.lobbyCard} 
          ${isCurrent ? styles.isMe : ''} 
          ${isOffline ? styles.offline : ''} 
          ${className}
        `}
          style={
            nicknameColor
              ? ({
                  '--player-nickname-color': nicknameColor,
                } as React.CSSProperties)
              : undefined
          }
        >
          {/* Left: Avatar & Name */}
          <div className={styles.leftSection}>
            <div
              className={styles.lobbyAvatar}
              style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
              onClick={e => {
                e.stopPropagation();
                const rect = (
                  e.currentTarget as HTMLDivElement
                ).getBoundingClientRect();

                const popupWidth = 240;
                const popupHeight = 300;
                const margin = 10;
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                let left = rect.right + margin;
                if (left + popupWidth + margin > windowWidth) {
                  left = rect.left - popupWidth - margin;
                }

                let top = rect.top - 200;
                if (top < margin) {
                  top = rect.top + rect.height + margin;
                }

                const maxLeft = Math.max(
                  margin,
                  windowWidth - popupWidth - margin,
                );
                const maxTop = Math.max(
                  margin,
                  windowHeight - popupHeight - margin,
                );
                const boundedLeft = Math.max(margin, Math.min(left, maxLeft));
                const boundedTop = Math.max(margin, Math.min(top, maxTop));

                setPopupPos({ top: boundedTop, left: boundedLeft });
                setPopupVisible(true);
              }}
            >
              {/* Show Initial if no avatar image */}
              {isBot ? (
                <BotAvatar />
              ) : (
                !avatar && (username?.trim()?.[0] ?? '?').toUpperCase()
              )}
            </div>

            <span className={styles.lobbyName} title={username}>
              {username}
            </span>
          </div>

          {/* Right: Status or Actions */}
          <div className={styles.rightSection}>
            {/* Case 1: Viewer is Host, looking at another player -> Show Actions Stack */}
            {showControls && !isHostMark && (
              <div className={styles.actionsStack}>
                {!isBot && (
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      onPromote?.();
                    }}
                    className={styles.actionBtn}
                    disabled={crownDisabled}
                    title="Сделать хостом"
                  >
                    <CrownIcon className={styles.promoteIcon} color="#ffffff" />
                  </Button>
                )}
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    onKick?.();
                  }}
                  className={styles.actionBtn}
                  title="Кикнуть"
                >
                  <svg className={styles.kickIcon}>
                    <use href="#close" />
                  </svg>
                </Button>
              </div>
            )}

            {/* Case 2: This player IS the Host -> Show Gold Crown */}
            {isHostMark && (
              <CrownIcon className={styles.hostCrownIcon} color="#f5d659" />
            )}
          </div>
        </div>
        {renderPopup()}
      </>
    );
  }

  // --- GAME VARIANT ---
  const isFufl = theme === 'fufl';
  const canKick = Boolean(isFufl && showControls && !isCurrent);
  const canPromote = Boolean(
    isFufl && showControls && !isCurrent && !isHostMark && !crownDisabled,
  );
  // UX:
  // - Хост всегда подсвечивается золотой или акцентной короной для всех зрителей
  // - Все остальные короны серые
  // - Кликабельность (promotion) зависит от прав хоста, а не от цвета
  // Для Fuflomicin используем красный акцент (#ff6b6b), для остальных - золото (#f5d659)
  const crownColor = isHostMark
    ? isFufl
      ? '#454442'
      : '#f5d659'
    : isFufl
      ? 'rgba(69, 68, 66, 0.3)'
      : '#6f7378';

  const botColor = isFufl ? '#454442' : '#6f7378';
  //${isMaster ? styles.isMaster : ''} ${theme === 'fufl' && isCurrent ? (styles.isCurrent ?? '') : ''}
  return (
    <div
      className={`${styles.gameRow} ${theme === 'fufl' ? styles.gameRowFufl : ''}`}
    >
      <div className={styles.gameLeft}>
        {!isBot ? (
          isFufl ? (
            canPromote ? (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onPromote?.();
                }}
                className={styles.fuflCrownBtn}
                disabled={crownDisabled}
                title="Передать права хоста"
              >
                <CrownIcon
                  className={`${styles.gameCrownFM}`}
                  color={crownColor}
                />
              </button>
            ) : (
              <CrownIcon
                className={`${styles.gameCrownFM}`}
                color={crownColor}
              />
            )
          ) : showControls && !isHostMark ? (
            /* Кнопка "Сделать хостом" для хоста BJ */
            <button
              onClick={e => {
                e.stopPropagation();
                onPromote?.();
              }}
              className={styles.gameActionBtn}
              disabled={crownDisabled}
              title="Сделать хостом"
            >
              <CrownIcon
                className={styles.gamePromoteIcon}
                color={crownColor}
              />
            </button>
          ) : (
            <CrownIcon className={`${styles.gameCrownBJ}`} color={crownColor} />
          )
        ) : (
          <BotAvatar className={styles.gameBotIconBJ} color={botColor} />
        )}
        {rank != null && (
          <span
            className={`${styles.gameRank} ${theme === 'fufl' && isCurrent ? (styles.isCurrent ?? '') : ''}`}
          >
            {rank}.
          </span>
        )}
        <span
          className={`${styles.gameName} ${isCurrent ? (styles.isCurrent ?? '') : ''}`}
          title={username}
        >
          {username}
        </span>
      </div>
      <div className={styles.gameRight}>
        {/* Кнопка "Кикнуть" для хоста BJ */}
        {theme !== 'fufl' && showControls && !isHostMark && (
          <button
            onClick={e => {
              e.stopPropagation();
              onKick?.();
            }}
            className={styles.gameActionBtn}
            title="Кикнуть"
          >
            <svg className={styles.gameKickIcon}>
              <use href="#close" />
            </svg>
          </button>
        )}

        {/* Fuflomicin: красный крестик кика у хоста напротив всех игроков, кроме себя */}
        {canKick && (
          <button
            onClick={e => {
              e.stopPropagation();
              onKick?.();
            }}
            className={styles.fuflKickBtn}
            title="Удалить игрока"
          >
            <svg className={styles.fuflKickIcon}>
              <use href="#close_fufl" />
            </svg>
          </button>
        )}
        <span
          className={`${styles.gameScore} ${
            isHostMark ? styles.gameScoreHost : ''
          } ${theme === 'fufl' && isCurrent ? (styles.isCurrent ?? '') : ''}`}
        >
          {score ?? 0}
        </span>
      </div>
    </div>
  );
};

export default PlayerCard;
