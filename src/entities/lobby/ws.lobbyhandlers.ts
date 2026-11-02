/* eslint-disable @typescript-eslint/no-explicit-any */
import { wsManager } from '@/websocket/WsManager';
import {
  setAll as setAllLobbyPlayers,
  setHostByUserId,
  setHostByPlayerId,
  reset as resetLobbyPlayers,
  upsertOne as upsertLobbyPlayer,
} from '@/entities/player/model/lobbyPlayerSlice';
import {
  setCurrentLobby,
  setIsPrivate,
  setMaxPlayers,
  resetOptimisticHost,
} from '@/store/slices/lobby/currentLobbySlice';
import {
  setRoomPassword,
  setIsKicked,
} from '@/store/slices/lobby/lobbyUiSlice';
import { navigationService } from '@/websocket/navigationService';
import { Ctx } from '../game/model/ws.gameBjHandlers';
import { syncCurrentPlayer, resetCurrentPlayer } from '@/entities/player/model';
import {
  reset as resetGamePlayers,
  setGameMeta,
} from '@/entities/player/model/gamePlayerSlice';
import { reset as resetGameBj } from '@/entities/game/model/gameBjSlice';
import { updateSettingsFromServer } from '@/features/gameSettings';
import { showWarning } from '@/websocket/warningService';

// Smart update imports
import {
  normalizePlayers,
  normalizeBotPayload,
} from '@/websocket/registry/wsEventRegistry';
import { logSkip, logEventReceived } from '@/websocket/utils/wsLogger';
import { dispatchWithWsMeta } from '@/websocket/middleware/smartUpdateMiddleware';

type StartGamePayload = { gameType: string; sessionId: number | string };

// ─────────────────────────────────────────────────────────────────────────────
// Extractors (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const toNumber = (value: unknown): number | null => {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function extractPlayers(message: any): any[] | null {
  if (Array.isArray(message?.player)) return message.player;
  if (Array.isArray(message?.players)) return message.players;
  if (Array.isArray(message?.room?.players)) return message.room.players;
  return null;
}

function extractLobby(message: any) {
  const room = message?.room ?? message;
  if (!room || typeof room !== 'object') return null;

  const {
    players: _drop,
    id,
    max_players,
    created_at,
    title,
    game_name,
    is_private,
    started,
  } = room;

  return {
    id: Number(id ?? 0),
    title: String(title ?? ''),
    created_at: created_at ?? '',
    game_name: String(game_name ?? ''),
    max_players: Number(max_players ?? 0),
    is_private: Boolean(is_private ?? false),
    started: Boolean(started ?? false),
  };
}

const extractPassword = (message: any): { defined: boolean; value: string } => {
  if (!message || typeof message !== 'object') {
    return { defined: false, value: '' };
  }

  if (Object.prototype.hasOwnProperty.call(message, 'password')) {
    const raw = (message as Record<string, unknown>).password;
    return { defined: true, value: raw == null ? '' : String(raw) };
  }

  const tryPaths: any[] = [
    message?.settings,
    message?.new_settings,
    message?.room,
  ];

  for (const candidate of tryPaths) {
    if (!candidate || typeof candidate !== 'object') continue;
    if (Object.prototype.hasOwnProperty.call(candidate, 'password')) {
      const raw = candidate.password;
      return { defined: true, value: raw == null ? '' : String(raw) };
    }
  }

  return { defined: false, value: '' };
};

const extractIsPrivate = (message: any): boolean | null => {
  if (typeof message?.is_private === 'boolean') return message.is_private;
  if (typeof message?.private === 'boolean') return message.private;
  if (typeof message?.room?.is_private === 'boolean')
    return message.room.is_private;
  if (typeof message?.settings?.is_private === 'boolean')
    return message.settings.is_private;
  if (typeof message?.new_settings?.is_private === 'boolean')
    return message.new_settings.is_private;
  return null;
};

const extractMaxPlayers = (message: any): number | null => {
  const direct = toNumber(message?.new_max_players ?? message?.max_players);
  if (direct != null) return direct;
  const candidates = [message?.room, message?.settings, message?.new_settings];
  for (const item of candidates) {
    if (!item) continue;
    const nested = toNumber(item?.max_players);
    if (nested != null) return nested;
  }
  return null;
};

const extractHostUserId = (message: any): number | null => {
  const raw =
    message?.new_host_id ??
    message?.new_host ??
    message?.host_id ??
    message?.user_id ??
    message?.userId;
  return toNumber(raw);
};

const extractGameSettings = (message: any) => {
  const settings = message?.settings ?? message?.new_settings;
  if (!settings || typeof settings !== 'object') {
    return null;
  }

  const result: {
    player_round_second?: number;
    victory_points?: number;
    censorship?: boolean;
    count_card?: number;
    deck_size?: number | null;
  } = {};

  const playerRoundSecond = toNumber(settings.player_round_second);
  if (playerRoundSecond !== null) {
    result.player_round_second = playerRoundSecond;
  }

  const victoryPoints = toNumber(settings.victory_points);
  if (victoryPoints !== null) {
    result.victory_points = victoryPoints;
  }

  if (typeof settings.censorship === 'boolean') {
    result.censorship = settings.censorship;
  }

  const countCard = toNumber(settings.count_card);
  if (countCard !== null) {
    result.count_card = countCard;
  }

  if (settings.deck_size !== undefined) {
    result.deck_size = settings.deck_size;
  }

  if (Object.keys(result).length === 0) {
    return null;
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Smart Players Sync with Compare Strategy
// ─────────────────────────────────────────────────────────────────────────────

interface PlayersSnapshot {
  normalized: any[];
}

interface SmartSyncContext {
  snapshot: PlayersSnapshot | null;
}

/**
 * Smart sync players with fingerprint comparison
 * Uses compare strategies from the new system
 */
function smartSyncPlayers(
  ctx: SmartSyncContext,
  dispatch: any,
  message: any,
  eventName: string,
): boolean {
  const rawPlayers = extractPlayers(message);
  if (!Array.isArray(rawPlayers)) {
    logSkip(eventName, 'no players array');
    return false;
  }
  const normalized = normalizePlayers({ players: rawPlayers });
  dispatchWithWsMeta(
    dispatch,
    eventName,
    setAllLobbyPlayers(normalized as any),
  );
  ctx.snapshot = { normalized };
  dispatch(syncCurrentPlayer());
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Register Handlers
// ─────────────────────────────────────────────────────────────────────────────

export function registerLobbyHandlers(opts?: {
  onStartGame?: (payload: StartGamePayload) => void;
}) {
  // Smart sync context with snapshot
  const syncCtx: SmartSyncContext = { snapshot: null };

  const applyPasswordIfPresent = (dispatch: any, message: any) => {
    const password = extractPassword(message);
    if (password.defined) {
      dispatch(setRoomPassword(password.value));
    }
  };

  const applySettingsSnapshot = (
    dispatch: any,
    message: any,
    eventName: string = 'change_settings',
  ) => {
    const isPrivate = extractIsPrivate(message);
    if (isPrivate != null) {
      dispatchWithWsMeta(dispatch, eventName, setIsPrivate(Boolean(isPrivate)));
    }
    applyPasswordIfPresent(dispatch, message);
    const maxPlayers = extractMaxPlayers(message);
    if (maxPlayers != null) {
      dispatchWithWsMeta(dispatch, eventName, setMaxPlayers(maxPlayers));
    }
    const gameSettings = extractGameSettings(message);
    if (gameSettings) {
      dispatchWithWsMeta(
        dispatch,
        eventName,
        updateSettingsFromServer(gameSettings),
      );
    }
  };

  const lobbyHandlers = {
    user_join: ({ dispatch }: any, message: any) => {
      logEventReceived('user_join', JSON.stringify(message).length);
      const lobby = extractLobby(message);
      if (lobby)
        dispatchWithWsMeta(dispatch, 'user_join', setCurrentLobby(lobby));

      applyPasswordIfPresent(dispatch, message);

      const gameSettings = extractGameSettings(message);
      if (gameSettings) {
        dispatchWithWsMeta(
          dispatch,
          'user_join',
          updateSettingsFromServer(gameSettings),
        );
      }

      smartSyncPlayers(syncCtx, dispatch, message, 'user_join');
    },

    bot_join: ({ dispatch }: any, message: any) => {
      logEventReceived('bot_join', JSON.stringify(message).length);
      const normalizedBot = normalizeBotPayload(message);
      dispatchWithWsMeta(
        dispatch,
        'bot_join',
        upsertLobbyPlayer(normalizedBot),
      );
      dispatch(syncCurrentPlayer());
    },

    user_leave: ({ dispatch }: any, message: any) => {
      logEventReceived('user_leave', JSON.stringify(message).length);
      // const lobby = extractLobby(message);
      // if (lobby)
      //   dispatchWithWsMeta(dispatch, 'user_leave', setCurrentLobby(lobby));
      smartSyncPlayers(syncCtx, dispatch, message, 'user_leave');
    },

    user_kick: ({ dispatch }: any, message: any) => {
      logEventReceived('user_kick', JSON.stringify(message).length);
      // const lobby = extractLobby(message);
      // if (lobby)
      //   dispatchWithWsMeta(dispatch, 'user_kick', setCurrentLobby(lobby));
      const players = extractPlayers(message);
      if (Array.isArray(players)) {
        const normalized = normalizePlayers({ players });
        dispatchWithWsMeta(
          dispatch,
          'user_kick',
          setAllLobbyPlayers(normalized as any),
        );
        dispatch(syncCurrentPlayer());
      }
    },
    /**
     * exit_from_all - Room was dissolved by host (all players are removed)
     * - Очищает lobbyPlayers, gamePlayers, currentPlayer, currentLobby
     * - НЕ разлогинивает пользователя
     * - Показывает предупреждение, по подтверждению уводит на список комнат
     */
    exit_from_all: ({ dispatch }: any, message: any) => {
      logEventReceived('exit_from_all', JSON.stringify(message).length);

      const text =
        message?.message ||
        'Комната была распущена хостом. Вы вернётесь на главный экран.';

      showWarning({
        title: 'УПС...',
        text,
        // Не задаём redirectPath, чтобы WarningModal не вызывал logoutFlow
        redirectPath: '',
        onConfirm: () => {
          // Чистим все связанные сессии лобби/игры, но не user
          dispatch(resetLobbyPlayers());
          dispatch(resetGamePlayers());
          //dispatch(resetCurrentLobby());
          dispatch(resetCurrentPlayer());

          // Уводим на страницу списка комнат без логаута
          navigationService.navigate('/lobby#rooms', { replace: true });
        },
      });
    },
    change_host: ({ dispatch }: any, message: any) => {
      logEventReceived('change_host', JSON.stringify(message).length);
      const hostId = toNumber(message?.new_host_id ?? message?.new_host);
      if (hostId != null) {
        dispatchWithWsMeta(dispatch, 'change_host', setHostByUserId(hostId));
        dispatch(syncCurrentPlayer());
      }
      const maybePlayers = extractPlayers(message);
      if (Array.isArray(maybePlayers)) {
        smartSyncPlayers(syncCtx, dispatch, message, 'change_host');
      }
    },

    lobby_state: ({ dispatch }: any, message: any) => {
      logEventReceived('lobby_state', JSON.stringify(message).length);

      const lobby = extractLobby(message);
      if (lobby)
        dispatchWithWsMeta(dispatch, 'lobby_state', setCurrentLobby(lobby));

      applyPasswordIfPresent(dispatch, message);

      const gameSettings = extractGameSettings(message);
      if (gameSettings) {
        dispatchWithWsMeta(
          dispatch,
          'lobby_state',
          updateSettingsFromServer(gameSettings),
        );
      }

      smartSyncPlayers(syncCtx, dispatch, message, 'lobby_state');
    },

    change_private: ({ dispatch }: any, message: any) => {
      logEventReceived('change_private', JSON.stringify(message).length);
      applySettingsSnapshot(dispatch, message, 'change_private');
    },

    change_max_players: ({ dispatch }: any, message: any) => {
      logEventReceived('change_max_players', JSON.stringify(message).length);

      const maxPlayers = extractMaxPlayers(message);
      if (maxPlayers != null) {
        dispatchWithWsMeta(
          dispatch,
          'change_max_players',
          setMaxPlayers(maxPlayers),
        );
      }
    },

    change_settings: ({ dispatch }: any, message: any) => {
      logEventReceived('change_settings', JSON.stringify(message).length);
      applySettingsSnapshot(dispatch, message, 'change_settings');
    },

    settings: ({ dispatch }: any, message: any) => {
      logEventReceived('settings', JSON.stringify(message).length);
      applySettingsSnapshot(dispatch, message, 'settings');
    },

    /** pre_start - Navigate all players to game screen */
    pre_start({ dispatch }: Ctx, m: any) {
      logEventReceived('pre_start', JSON.stringify(m).length);

      sessionStorage.removeItem('gameFinished');
      sessionStorage.removeItem('finishedLobbyId');

      // Use game_name instead of game_type (server sends game_name)
      const gameName = m?.game_name || m?.game_type || 'Black_Jokes';
      const gameId = Number(m.game_id);
      console.log('[pre_start] Navigating to game screen:', gameName, m);
      navigationService.navigateToGame(gameName);
      dispatch(setGameMeta({ gameType: 'fuf', gameId }));
    },

    start_game: ({ dispatch }: any, message: any) => {
      logEventReceived('start_game', JSON.stringify(message).length);

      const payload: StartGamePayload = {
        gameType: String(message?.gameType ?? message?.game_type ?? 'unknown'),
        sessionId: message?.sessionId ?? message?.session_id,
      };

      // Switch websocket into the game channel.
      wsManager.activateGroup(`game:${payload.gameType}`);

      // Reset snapshot for next lobby entry
      syncCtx.snapshot = null;
      dispatch(resetOptimisticHost());

      opts?.onStartGame?.(payload);
    },

    /**
     * user_kicked_message - Plain text message "Вас исключили из лобби"
     * Shows warning modal with the message
     */
    user_kicked_message: ({ dispatch }: any, message: any) => {
      logEventReceived('user_kicked_message', JSON.stringify(message).length);

      sessionStorage.removeItem('currentGameId');
      sessionStorage.removeItem('currentGameType');

      showWarning({
        title: 'Упс',
        text: 'Вы были удалены из комнаты',
        redirectPath: '/',
        confirmText: 'Ок',
      });
    },

    /**
     * exit_all_from_game - Return all players from game to lobby
     * - Resets game state (gameId, status)
     * - Clears gamePlayers
     * - Updates lobbyPlayers with players from message
     * - Navigates back to lobby
     */
    exit_all_from_game: ({ dispatch }: any, message: any) => {
      logEventReceived('exit_all_from_game', JSON.stringify(message).length);

      sessionStorage.removeItem('currentGameId');
      sessionStorage.removeItem('currentGameType');

      // IMPORTANT: Reset game state BEFORE clearing players
      // This prevents "insufficient players" warning from triggering
      dispatch(resetGameBj());

      // Clear game players
      dispatch(resetGamePlayers());

      // Update lobby players if provided
      const players = Array.isArray(message?.players) ? message.players : [];
      if (players.length > 0) {
        const normalized = normalizePlayers({ players });
        dispatchWithWsMeta(
          dispatch,
          'exit_all_from_game',
          setAllLobbyPlayers(normalized as any),
        );
        // Sync current player after update
        setTimeout(() => {
          dispatch(syncCurrentPlayer());
        }, 0);
      }

      // Navigate back to lobby
      const lobbyId =
        message?.room_id ||
        message?.room?.id ||
        (message?.players?.[0]?.room_id
          ? Number(message.players[0].room_id)
          : null);

      if (lobbyId) {
        // Absolute path with lobby_id
        navigationService.navigate(`/lobby/${lobbyId}`, {
          replace: true,
          state: { fromGame: true },
        });
      } else {
        // Relative path - return from /lobby/:id/evil-cards to /lobby/:id
        navigationService.navigate('..', {
          replace: true,
          state: { fromGame: true },
        });
      }
    },
  } as const;

  wsManager.registerGroup('lobby', lobbyHandlers);
}
