import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import styles from './PlayersContainer.module.scss';
import type { RootState } from '@/store/store';
import { getUserId } from '@/entities/user/model/slice';
import { selectAllGamePlayers } from '@/entities/player/model/gamePlayerSlice';
import { selectAllLobbyPlayers } from '@/entities/player/model/lobbyPlayerSlice';
import { selectCurrentPlayer } from '@/entities/player/model/currentPlayerSlice';
import {
  selectCurrentLobbyId,
  selectHostUserId,
} from '@/store/slices/lobby/currentLobbySlice';
import { PlayerCard } from '@/shared/player-card/ui/PlayerCard';
import { GameControlPanel } from '@/shared/game-control-panel';
import { Button } from '@/shared/ui/Button';
import { ModalGameDescription } from '@/features/game-description';
import { descriptionFuflomicin } from '@/features/game-description/const/descriptionFuflomicin';
import { useUser } from '@/entities/user/model/hooks';
import { useWebSocket } from '@/store/contexts/WsRootProvider';
import { useWarning } from '@/features/warnings/hooks/useWarning';
import { usePlayerAction } from '@/features/player-action-modal';
import { Round } from '@/fuflomicin/shared/components/Round/Round';

interface PlayersContainerProps {
  gameDescription?: typeof descriptionFuflomicin;
}

export const PlayersContainer = ({
  gameDescription,
}: PlayersContainerProps = {}) => {
  const gameMode = useSelector((s: any) => s.modal.gameMode);
  const isHff = gameMode === 'hff';
  const gamePlayers = useSelector(selectAllGamePlayers);
  const lobbyPlayers = useSelector(selectAllLobbyPlayers);
  const players = gamePlayers.length > 0 ? gamePlayers : lobbyPlayers;
  const userId = useSelector(getUserId);
  const currentPlayer = useSelector(selectCurrentPlayer) as any;
  const masterId = useSelector((s: RootState) => s.fuflGame.masterId);
  const gameStatus = useSelector((s: RootState) => s.fuflGame.status);
  const gameId = useSelector((s: RootState) => s.fuflGame.gameId);
  const gameName = useSelector((s: RootState) => s.fuflGame.gameName);
  const lobbyId = useSelector(selectCurrentLobbyId);
  const hostUserId = useSelector(selectHostUserId);

  const { isHost } = useUser();
  const { send } = useWebSocket();
  const { showWarning } = useWarning();
  const { openPromoteModal, openKickModal } = usePlayerAction();
  const [showRules, setShowRules] = useState(false);

  const handlePlay = (command: 'pause' | 'resume', gameName: string) => {
    const messageStatus = {
      command,
      game_name: String(gameName),
    };
    if (isHost()) {
      send(messageStatus);
    } else {
      showWarning({
        title: 'Действие недоступно',
        text: 'Только хост может управлять паузой.',
        theme: 'game',
      });
    }
  };

  const handlePromoteUser = (
    id: number,
    username: string,
    user_id?: number,
  ) => {
    openPromoteModal({ id, username, user_id });
  };

  const handleDeleteUser = (
    id: number,
    username: string,
    user_id?: number,
    player_id?: number,
  ) => {
    openKickModal({ id, username, user_id, player_id });
  };

  return (
    <div className="d-flex flex-column players players__game w-100 h-100 mw-100">
      <div className={`${styles.gamePanel} ${isHff ? styles.hff : ''}`}>
        {isHff && (
          <div
            className={`commercial d-flex justify-content-center align-items-center ${styles.commercialHff}`}
          >
            <div>
              <a
                href="https://discord.gg/bYjdJsK5ZH"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="commercial__btn-discord" />
              </a>
            </div>
            <div>
              <a
                href="https://boosty.to/towerdragon/donate"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="commercial__btn-boosty" />
              </a>
            </div>
          </div>
        )}
        <GameControlPanel
          isHost={isHost()}
          gameStatus={gameStatus}
          gameId={gameId}
          gameName={gameName}
          lobbyId={lobbyId}
          onShowRules={() => setShowRules(true)}
          onPlay={handlePlay}
          onShowSettings={() => {}}
          onShowExit={() => {}}
          theme="fufl"
        />
        <div className={`${styles.players_wrapper} ${isHff ? styles.hff : ''}`}>
          <Round />
          <div
            className={`${styles.players_list_header} ${isHff ? styles.hff : ''}`}
          >
            <div className={styles.players_list_header_left}>
              <span>#</span>
              <span>игрок</span>
            </div>
            <div className={styles.players_list_header_right}>очки</div>
          </div>

          <ul className={styles.players_list}>
            <AnimatePresence initial={true} mode="popLayout">
              {players.length === 0
                ? Array.from({ length: 3 }).map((_, i) => (
                    <motion.li
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        transition: { delay: i * 0.07, duration: 0.3 },
                      }}
                      exit={{
                        opacity: 0,
                        x: 30,
                        scale: 0.9,
                        transition: { duration: 0.2 },
                      }}
                      layout
                    >
                      <PlayerCard
                        variant="game"
                        theme="fufl"
                        username=""
                        loading
                      />
                    </motion.li>
                  ))
                : players.map((p: any, idx: number) => {
                    const isMe =
                      userId != null && Number(p?.user_id) === Number(userId);
                    const isMaster =
                      masterId != null && Number(p?.id) === Number(masterId);
                    const isHostMark =
                      Boolean(p?.is_host) ||
                      (hostUserId != null &&
                        Number(p?.user_id) === Number(hostUserId));
                    const isOffline = Boolean(p?.is_disconnect);
                    const username = String(p?.name ?? '');
                    const isBot = (p.is_bot || !Boolean(p.user_id)) ?? false;

                    return (
                      <motion.li
                        key={p.id}
                        custom={idx}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: 1,
                          transition: {
                            delay: idx * 0.07,
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          },
                        }}
                        exit={{
                          opacity: 0,
                          x: 30,
                          scale: 0.9,
                          transition: { duration: 0.2, ease: 'easeIn' },
                        }}
                        layout
                      >
                        <PlayerCard
                          variant="game"
                          theme="fufl"
                          username={username}
                          avatar={p?.avatar ?? null}
                          nicknameColor={p?.nickname_color ?? undefined}
                          isHostMark={isHostMark}
                          isOffline={isOffline}
                          isCurrent={Boolean(isMe)}
                          isMaster={isMaster}
                          rank={idx + 1}
                          score={Number(p?.points ?? 0)}
                          showControls={isHost() && !isMe}
                          onPromote={() =>
                            handlePromoteUser(p.id, username, p.user_id)
                          }
                          onKick={() =>
                            handleDeleteUser(
                              p.id,
                              username,
                              p.user_id,
                              p.player_id,
                            )
                          }
                          crownDisabled={isOffline}
                          isBot={isBot}
                        />
                      </motion.li>
                    );
                  })}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      {/* currentPlayer используется как источник правды о "мне" в игре (если нужно дебажить) */}
      {process.env.NODE_ENV === 'development' && currentPlayer?.id
        ? null
        : null}
      <ModalGameDescription
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        description={gameDescription ?? descriptionFuflomicin}
      />
    </div>
  );
};
