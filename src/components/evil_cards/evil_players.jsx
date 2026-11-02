import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useWarning } from '../../features/warnings/index';
import { useWebSocket } from '../../store/contexts/WsRootProvider';
import { usePlayerAction } from '../../features/player-action-modal';
import {
  selectCurrentLobbyId,
  selectHostUserId,
  selectIsHostFromCurrent,
} from '../../store/slices/lobby/currentLobbySlice';
import { selectIsKicked } from '../../store/slices/lobby/lobbyUiSlice';
import { ModalGameDescription } from '../../features/game-description/index';
import {
  selectGameId,
  selectGameName,
  selectGameStatus,
  selectMasterId,
} from '../../entities/game/model/gameBjSlice';
import { selectAllGamePlayers } from '@/entities/player/model/gamePlayerSlice';
import { selectAllLobbyPlayers } from '@/entities/player/model/lobbyPlayerSlice';
import { getUserId, getAccessToken } from '../../entities/user/model/slice';
import { getCurrentUserId as decodeUserId } from '../../components/helpers/help_functions';
import { PlayerList } from '@/widgets/player-list';
import { GameControlPanel } from '@/shared/game-control-panel';
import { Button } from '../../shared/ui/Button';

export const Players = () => {
  const { send } = useWebSocket();
  const currentUserId = useSelector(getUserId);
  const hostUserId = useSelector(selectHostUserId);
  const isHostFromSlice = useSelector(selectIsHostFromCurrent);
  const userToken = useSelector(getAccessToken);
  const { showWarning } = useWarning();
  const isKicked = useSelector(selectIsKicked);
  const { openPromoteModal, openKickModal } = usePlayerAction();
  const lobbyId = useSelector(selectCurrentLobbyId);

  const gameId = useSelector(selectGameId);
  const gameName = useSelector(selectGameName);
  const gameStatus = useSelector(selectGameStatus);
  const masterId = useSelector(selectMasterId);
  const mappedPlayers = useSelector(selectAllGamePlayers);
  const lobbyPlayers = useSelector(selectAllLobbyPlayers);
  const displayedPlayers =
    mappedPlayers.length > 0 ? mappedPlayers : lobbyPlayers;
  // const currentUserId = useSelector(getUserId); // useUser уже предоставляет userId

  const effectiveUserId = currentUserId ?? decodeUserId(userToken);
  const isHostCurrent =
    Boolean(isHostFromSlice) ||
    (hostUserId != null &&
      effectiveUserId != null &&
      Number(hostUserId) === Number(effectiveUserId));
  const effectiveHostUserId = hostUserId ?? null;

  // локальный стейт для модалки правил
  const [showRules, setShowRules] = useState(false);

  // Обработчики для модалок через контекст
  const handlePromoteUser = (id, username, user_id) => {
    openPromoteModal({ id, username, user_id });
  };
  const handleDeleteUser = (id, username, user_id, player_id) => {
    openKickModal({ id, username, user_id, player_id });
  };

  const handlePlay = (command, gameName) => {
    const messageStatus = {
      command,
      game_name: String(gameName),
    };
    if (isHostCurrent) {
      send(messageStatus);
    } else {
      showWarning({
        title: 'Действие недоступно',
        text: 'Только хост может управлять паузой.',
        theme: 'game',
      });
    }
  };

  return (
    <div className="d-flex flex-column players players__game w-100 h-100">
      <div className="commercial d-flex justify-content-between">
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
      <GameControlPanel
        isHost={isHostCurrent}
        gameStatus={gameStatus}
        gameName={gameName}
        lobbyId={lobbyId}
        onShowRules={() => setShowRules(true)}
        onPlay={handlePlay}
        onShowSettings={() => {}}
        onShowExit={() => {}}
      />
      <PlayerList
        players={displayedPlayers}
        variant="game"
        currentUserId={currentUserId}
        hostUserId={effectiveHostUserId}
        onPromote={
          isHostCurrent
            ? (id, username, user_id) =>
                handlePromoteUser(id, username, user_id)
            : undefined
        }
        onKick={
          isHostCurrent
            ? (id, username, user_id, player_id) =>
                handleDeleteUser(id, username, user_id, player_id)
            : undefined
        }
        masterId={masterId}
        className="players-list"
      />
      <ModalGameDescription
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />
    </div>
  );
};
