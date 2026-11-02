import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectLobbyPlayerEntities } from '@/entities/player/model/lobbyPlayerSlice';
import { selectIsHostFromCurrent } from '@/store/slices/lobby/currentLobbySlice';
import { resetCurrentLobby } from '@/store/slices/lobby/currentLobbySlice';
import { reset as resetLobbyPlayers } from '@/entities/player/model/lobbyPlayerSlice';
import { resetCurrentPlayer } from '@/entities/player/model/currentPlayerSlice';
import { selectGamePlayerEntities } from '@/entities/player/model/gamePlayerSlice';
import { resetGame } from '@/store/slices/game/gameSlice';
import { setIsKicked, selectIsKicked } from '@/store/slices/lobby/lobbyUiSlice';
import { useWebSocket } from '@/store/contexts/WsRootProvider';
import { navigationService } from '@/websocket/navigationService';
import { useWarning } from '@/features/warnings/hooks/useWarning';
import {
  useInteraction,
  type InteractionStatus,
} from '@/features/interaction-orchestrator';
import { resolveKickLobbyPlayerId } from '../lib/resolveKickTarget';

export interface PlayerInfo {
  id: number;
  username: string;
  user_id?: number | null;
  player_id?: number | null;
}

export type ActionMode = 'kick' | 'promote' | 'info' | null;

export interface PlayerActionState {
  isOpen: boolean;
  mode: ActionMode;
  player: PlayerInfo | null;
  variant: 'lobby' | 'game' | 'fufl' | 'hff';
  message?: string;
  interactionId: string | null;
  interactionStatus: InteractionStatus;
  errorMessage?: string;
}

export interface PlayerActionContextValue {
  state: PlayerActionState;
  openKickModal: (player: PlayerInfo) => void;
  openPromoteModal: (player: PlayerInfo) => void;
  openInfoModal: (message: string) => void;
  closeModal: () => void;
  confirmAction: () => Promise<void>;
}

const initialState: PlayerActionState = {
  isOpen: false,
  mode: null,
  player: null,
  variant: 'lobby',
  interactionId: null,
  interactionStatus: 'idle',
};

export const PlayerActionContext = createContext<PlayerActionContextValue>({
  state: initialState,
  openKickModal: () => {},
  openPromoteModal: () => {},
  openInfoModal: () => {},
  closeModal: () => {},
  confirmAction: async () => {},
});

interface PlayerActionProviderProps {
  children: ReactNode;
}

const resolveTargetUserId = (
  player: PlayerInfo,
  lobbyEntities: Record<string, unknown>,
): number | null => {
  if (player.user_id != null) {
    return Number(player.user_id);
  }

  const byPlayerId = lobbyEntities[String(player.id)] as
    | { user_id?: number }
    | undefined;
  if (byPlayerId?.user_id != null) {
    return Number(byPlayerId.user_id);
  }

  const fallback = Object.values(lobbyEntities).find(
    entity =>
      Number((entity as { id?: number } | undefined)?.id) === Number(player.id),
  ) as { user_id?: number } | undefined;

  return Number(fallback?.user_id ?? 0) || null;
};

export const PlayerActionProvider: React.FC<PlayerActionProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<PlayerActionState>(initialState);
  const gameMode = useSelector(
    (s: { modal: { gameMode: string | false } }) => s.modal.gameMode,
  );
  const getVariant = (): 'lobby' | 'game' | 'fufl' | 'hff' =>
    gameMode === 'fuflomicin'
      ? 'fufl'
      : gameMode === 'hff'
        ? 'hff'
        : gameMode
          ? 'game'
          : 'lobby';

  const { send } = useWebSocket();
  const { showWarning } = useWarning();
  const {
    activeInteractions,
    startInteraction,
    failInteraction,
    finishInteraction,
  } = useInteraction();
  const lobbyEntities = useSelector(selectLobbyPlayerEntities);
  const gameEntities = useSelector(selectGamePlayerEntities);
  const isHost = useSelector(selectIsHostFromCurrent);
  const isKicked = useSelector(selectIsKicked);
  const dispatch = useDispatch();

  const openKickModal = useCallback(
    (player: PlayerInfo) => {
      setState({
        isOpen: true,
        mode: 'kick',
        player,
        variant: getVariant(),
        interactionId: null,
        interactionStatus: 'idle',
        errorMessage: undefined,
      });
    },
    [gameMode],
  );

  const openPromoteModal = useCallback(
    (player: PlayerInfo) => {
      setState({
        isOpen: true,
        mode: 'promote',
        player,
        variant: getVariant(),
        interactionId: null,
        interactionStatus: 'idle',
        errorMessage: undefined,
      });
    },
    [gameMode],
  );

  const openInfoModal = useCallback(
    (message: string) => {
      setState({
        isOpen: true,
        mode: 'info',
        player: null,
        variant: getVariant(),
        message,
        interactionId: null,
        interactionStatus: 'idle',
        errorMessage: undefined,
      });
    },
    [gameMode],
  );

  const closeModal = useCallback(() => {
    setState(initialState);
  }, []);

  const confirmAction = useCallback(async () => {
    if (state.mode !== 'info' && !state.player) return;
    if (state.mode !== 'info' && !isHost) return;
    if (state.interactionStatus === 'pending') return;

    if (state.mode === 'kick') {
      const sel = state.player;
      if (!sel) return;

      const targetPlayerId = resolveKickLobbyPlayerId(
        sel,
        state.variant,
        lobbyEntities,
        gameEntities,
      );
      if (!targetPlayerId) {
        setState(prev => ({
          ...prev,
          interactionStatus: 'error',
          errorMessage: 'Не удалось определить игрока для удаления',
        }));
        return;
      }

      const interactionId = startInteraction('lobby-kick-player', {
        payload: { targetPlayerId },
        expectedEvents: ['user_kick'],
      });

      setState(prev => ({
        ...prev,
        interactionId,
        interactionStatus: 'pending',
        errorMessage: undefined,
      }));

      try {
        await send({
          command: 'delete_user',
          delete_player: targetPlayerId,
          interactionId,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Не удалось отправить команду';
        failInteraction(interactionId, message);
        setState(prev => ({
          ...prev,
          interactionStatus: 'error',
          errorMessage: message,
        }));
      }
    } else if (state.mode === 'promote') {
      const sel = state.player;
      if (!sel) return;
      const targetUserId = resolveTargetUserId(
        sel,
        lobbyEntities as Record<string, unknown>,
      );
      if (!targetUserId) return;

      const interactionId = startInteraction('lobby-promote-host', {
        payload: { targetUserId },
        expectedEvents: ['change_host'],
      });

      setState(prev => ({
        ...prev,
        interactionId,
        interactionStatus: 'pending',
        errorMessage: undefined,
      }));

      try {
        await send({
          command: 'change_host',
          new_host: targetUserId,
          interactionId,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Не удалось отправить команду';
        failInteraction(interactionId, message);
        setState(prev => ({
          ...prev,
          interactionStatus: 'error',
          errorMessage: message,
        }));
      }
    } else if (state.mode === 'info') {
      dispatch(setIsKicked(false));
      dispatch(resetLobbyPlayers());
      dispatch(resetCurrentLobby());
      dispatch(resetCurrentPlayer());
      dispatch(resetGame());
      navigationService.navigate('/lobby#rooms');
      closeModal();
    }
  }, [
    state.mode,
    state.player,
    state.variant,
    state.interactionStatus,
    send,
    closeModal,
    lobbyEntities,
    gameEntities,
    isHost,
    dispatch,
    startInteraction,
    failInteraction,
  ]);

  React.useEffect(() => {
    if (!state.interactionId) {
      if (state.interactionStatus !== 'idle') {
        setState(prev => ({
          ...prev,
          interactionStatus: 'idle',
          errorMessage: undefined,
        }));
      }
      return;
    }

    const interaction = activeInteractions[state.interactionId];
    if (!interaction) {
      return;
    }

    if (interaction.status !== state.interactionStatus) {
      setState(prev => ({
        ...prev,
        interactionStatus: interaction.status,
        errorMessage: interaction.error,
      }));
    }
  }, [activeInteractions, state.interactionId, state.interactionStatus]);

  React.useEffect(() => {
    if (!state.interactionId || state.interactionStatus !== 'success') {
      return;
    }

    finishInteraction(state.interactionId);
    closeModal();
  }, [
    state.interactionId,
    state.interactionStatus,
    finishInteraction,
    closeModal,
  ]);

  React.useEffect(() => {
    if (isKicked) {
      showWarning({
        title: 'Упс',
        text: 'Вы были удалены из комнаты',
        confirmText: 'Ок',
        redirectPath: '/lobby',
        onConfirm: () => {
          dispatch(setIsKicked(false));
          dispatch(resetLobbyPlayers());
          dispatch(resetCurrentLobby());
          dispatch(resetCurrentPlayer());
          dispatch(resetGame());
        },
      });
    }
  }, [isKicked, showWarning, dispatch]);

  return (
    <PlayerActionContext.Provider
      value={{
        state,
        openKickModal,
        openPromoteModal,
        openInfoModal,
        closeModal,
        confirmAction,
      }}
    >
      {children}
    </PlayerActionContext.Provider>
  );
};
