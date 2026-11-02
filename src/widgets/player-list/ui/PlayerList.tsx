import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PlayerCard } from '@/shared/player-card/ui/PlayerCard';
import { getRankInfo, rankLevels } from '@/features/personalProfileProgressBar';
import { useGetPersonalAreaQuery } from '@/entities/user/api/user-api';
import { AddBotButton } from '@/features/lobby-bots';
import styles from './PlayerList.module.scss';
export type PlayerListProps = {
  players: any[];
  currentUserId: number | string | null;
  hostUserId?: number | string | null;
  masterId?: number | string | null;
  variant?: 'lobby' | 'game';
  onPromote?: (id: number | string, username: string, user_id?: number) => void;
  onKick?: (
    id: number | string,
    username: string,
    user_id?: number,
    player_id?: number,
  ) => void;
  className?: string;
  maxPlayers?: number;
  skeletonCount?: number;
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.07,
      duration: 0.32,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.94,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
};

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentUserId,
  hostUserId,
  masterId,
  variant = 'lobby',
  onPromote,
  onKick,
  className = '',
  maxPlayers,
  skeletonCount,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);
  const [isExpanded, setIsExpanded] = useState(false);
  const resolvedSkeletonCount =
    skeletonCount ?? (maxPlayers ? Math.min(maxPlayers, 6) : 3);
  const { data: profile } = useGetPersonalAreaQuery();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const amIHost =
    hostUserId && currentUserId && Number(hostUserId) === Number(currentUserId);

  const handleToggle = () => {
    if (isMobile) setIsExpanded(!isExpanded);
  };

  if (variant === 'game') {
    return (
      <div className={`d-flex flex-column ${className}`}>
        <AnimatePresence initial={true} mode="popLayout">
          {players.length === 0
            ? Array.from({ length: resolvedSkeletonCount }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="mb-2"
                >
                  <PlayerCard username="" variant={variant} loading />
                </motion.div>
              ))
            : players.map((player, index) => {
                const playerId = player.id;
                const actionPlayerId = player.id ?? player.user_id;
                const username = player.username ?? player.name ?? 'Player';
                const avatar = player.avatar;
                const nicknameColor =
                  player.nickname_color ?? player.nicknameColor ?? '#4eb5b5';

                const isOffline = player.is_disconnect ?? false;
                const isBot =
                  (player.is_bot || !Boolean(player.user_id)) ?? false;
                const isVip = player.is_vip ?? false;

                const isHost =
                  typeof player.is_host === 'boolean'
                    ? player.is_host
                    : hostUserId
                      ? Number(player.user_id ?? player.id) ===
                        Number(hostUserId)
                      : false;

                const isCurrent =
                  currentUserId != null &&
                  Number(player.user_id ?? player.id) === Number(currentUserId);
                const isMaster =
                  masterId != null && Number(playerId) === Number(masterId);

                const showControls =
                  amIHost && (onPromote || onKick) && !isHost && !isCurrent;

                const actualExp = isCurrent
                  ? (profile?.exp ?? player.exp ?? 0)
                  : (player.exp ?? 0);
                const rankInfo = getRankInfo(actualExp, rankLevels);
                const rankName = `${rankInfo.currentRank} ${rankInfo.currentSubRank}`;

                const isFirst = index === 0;
                const hideOnMobile =
                  variant === 'lobby' && !isFirst && isMobile && !isExpanded;

                return (
                  <motion.div
                    key={playerId ?? index}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={hideOnMobile ? 'd-none' : 'mb-2'}
                    onClick={
                      variant === 'lobby' && isMobile && isFirst
                        ? handleToggle
                        : undefined
                    }
                  >
                    <PlayerCard
                      username={username}
                      avatar={avatar}
                      nicknameColor={nicknameColor}
                      isHostMark={isHost}
                      isOffline={isOffline}
                      isCurrent={isCurrent}
                      isMaster={isMaster}
                      isBot={isBot}
                      isVip={isVip}
                      isDisconnect={isOffline}
                      variant={variant}
                      score={player.points ?? player.score ?? actualExp}
                      rank={index + 1}
                      rankName={rankName}
                      exp={actualExp}
                      showControls={!!showControls}
                      onPromote={
                        onPromote
                          ? () =>
                              onPromote(
                                actionPlayerId,
                                username,
                                player.user_id,
                              )
                          : undefined
                      }
                      onKick={
                        onKick
                          ? () =>
                              onKick(
                                actionPlayerId,
                                username,
                                player.user_id,
                                player.player_id,
                              )
                          : undefined
                      }
                      crownDisabled={isOffline}
                    />

                    {variant === 'lobby' && isMobile && isFirst && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '50%',
                          transform: 'translateX(50%)',
                          bottom: '-4px',
                          fontSize: '10px',
                          color: '#55cccc',
                        }}
                      >
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronUp : faChevronDown}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}

          {amIHost &&
            players.length > 0 &&
            maxPlayers &&
            players.length < maxPlayers &&
            variant === 'lobby' && (
              <motion.div
                key="add-bot-btn"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className={
                  isMobile && !isExpanded && players.length > 0
                    ? 'd-none'
                    : 'mb-2 d-flex justify-content-center'
                }
              >
                <AddBotButton />
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`choose-scrollbar ${className}`}>
      <SimpleBar
        className="d-flex flex-column players__list"
        classNames={{
          contentEl: `${styles.playersListWrapper}`,
        }}
      >
        <AnimatePresence initial={true} mode="popLayout">
          {players.length === 0
            ? Array.from({ length: resolvedSkeletonCount }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="mb-2"
                >
                  <PlayerCard username="" variant={variant} loading />
                </motion.div>
              ))
            : players.map((player, index) => {
                const playerId = player.id;
                const actionPlayerId = player.id ?? player.user_id;
                const username = player.username ?? player.name ?? 'Player';
                const avatar = player.avatar;
                const nicknameColor =
                  player.nickname_color ?? player.nicknameColor ?? '#4eb5b5';

                const isOffline = player.is_disconnect ?? false;
                const isBot = player.is_bot ?? false;
                const isVip = player.is_vip ?? false;
                const isGuest = player.is_guest ?? false;

                const isHost =
                  typeof player.is_host === 'boolean'
                    ? player.is_host
                    : hostUserId
                      ? Number(player.user_id ?? player.id) ===
                        Number(hostUserId)
                      : false;

                const isCurrent =
                  currentUserId != null &&
                  Number(player.user_id ?? player.id) === Number(currentUserId);
                const isMaster =
                  masterId != null && Number(playerId) === Number(masterId);

                const showControls =
                  amIHost && (onPromote || onKick) && !isHost && !isCurrent;

                const actualExp = isCurrent
                  ? (profile?.exp ?? player.exp ?? 0)
                  : (player.exp ?? 0);
                const rankInfo = getRankInfo(actualExp, rankLevels);
                const rankName = `${rankInfo.currentRank} ${rankInfo.currentSubRank}`;

                const isFirst = index === 0;
                const hideOnMobile =
                  variant === 'lobby' && !isFirst && isMobile && !isExpanded;

                return (
                  <motion.div
                    key={playerId ?? index}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={hideOnMobile ? 'd-none' : 'mb-2'}
                    onClick={
                      variant === 'lobby' && isMobile && isFirst
                        ? handleToggle
                        : undefined
                    }
                  >
                    <PlayerCard
                      username={username}
                      avatar={avatar}
                      nicknameColor={nicknameColor}
                      isHostMark={isHost}
                      isOffline={isOffline}
                      isCurrent={isCurrent}
                      isMaster={isMaster}
                      isBot={isBot}
                      isGuest={isGuest}
                      isVip={isVip}
                      isDisconnect={isOffline}
                      variant={variant}
                      score={player.points ?? player.score ?? actualExp}
                      rank={index + 1}
                      rankName={rankName}
                      exp={actualExp}
                      showControls={!!showControls}
                      onPromote={
                        onPromote
                          ? () =>
                              onPromote(
                                actionPlayerId,
                                username,
                                player.user_id,
                              )
                          : undefined
                      }
                      onKick={
                        onKick
                          ? () =>
                              onKick(
                                actionPlayerId,
                                username,
                                player.user_id,
                                player.player_id,
                              )
                          : undefined
                      }
                      crownDisabled={isOffline}
                    />

                    {variant === 'lobby' && isMobile && isFirst && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '50%',
                          transform: 'translateX(50%)',
                          bottom: '-4px',
                          fontSize: '10px',
                          color: '#55cccc',
                        }}
                      >
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronUp : faChevronDown}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}

          {amIHost &&
            players.length > 0 &&
            maxPlayers &&
            players.length < maxPlayers &&
            variant === 'lobby' && (
              <motion.div
                key="add-bot-btn"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className={
                  isMobile && !isExpanded && players.length > 0
                    ? 'd-none'
                    : 'mb-2 d-flex justify-content-center'
                }
              >
                <AddBotButton />
              </motion.div>
            )}
        </AnimatePresence>
      </SimpleBar>
    </div>
  );
};
