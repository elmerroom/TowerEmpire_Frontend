import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './player-popup.module.scss';
import { BotIcon, VipIcon, CrownIcon, UserIcon } from '@/shared/ui/icons';

export interface PlayerPopupProps {
  username: string;
  avatar?: string | null;
  rank?: string | number;
  xp?: number;
  position: { top: number; left: number };
  onClose: () => void;
  isBot?: boolean;
  isDisconnect?: boolean;
  isGuest?: boolean;
  isHost?: boolean;
  isVip?: boolean;
  nicknameColor?: string;
}

export const PlayerPopup: React.FC<PlayerPopupProps> = ({
  username,
  avatar,
  rank,
  xp = 0,
  position,
  onClose,
  isBot,
  isDisconnect,
  isGuest,
  isHost,
  isVip,
  nicknameColor,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  return createPortal(
    <div
      className={styles.popup}
      style={{ top: position.top, left: position.left }}
      ref={popupRef}
    >
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className={styles.avatarWrapper}>
        <div
          className={styles.avatar}
          style={{
            ...(avatar ? { backgroundImage: `url(${avatar})` } : {}),
            ...(nicknameColor
              ? ({
                  '--player-nickname-color': nicknameColor,
                } as React.CSSProperties)
              : {}),
          }}
        >
          {!avatar && username?.[0]?.toUpperCase()}
        </div>
        <div
          className={`${styles.statusDot} ${isDisconnect ? styles.offline : ''}`}
          title={isDisconnect ? 'Offline' : 'Online'}
        />
      </div>

      <div className={styles.header}>
        <div
          className={styles.username}
          style={nicknameColor ? { color: nicknameColor } : undefined}
        >
          {username}
        </div>

        <div className={styles.badges}>
          {isHost && (
            <div className={`${styles.badge} ${styles.hostBadge}`}>
              <CrownIcon size={12} /> Хост
            </div>
          )}
          {isBot ? (
            <div className={`${styles.badge} ${styles.botBadge}`}>
              <BotIcon size={12} /> Бот
            </div>
          ) : isGuest ? (
            <div className={`${styles.badge} ${styles.guestBadge}`}>
              {' '}
              <UserIcon size={12} />
              Гость
            </div>
          ) : (
            <div className={`${styles.badge} ${styles.playerBadge}`}>
              {' '}
              <UserIcon size={12} />
              Игрок
            </div>
          )}
          {isVip && (
            <div className={`${styles.badge} ${styles.vipBadge}`}>
              <VipIcon size={12} /> VIP
            </div>
          )}
        </div>
      </div>

      <div className={styles.stats}>
        {rank != null && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Ранг</span>
            <span className={styles.statValue}>{rank}</span>
          </div>
        )}
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Опыт</span>
          <span className={styles.statValue}>{xp}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PlayerPopup;
