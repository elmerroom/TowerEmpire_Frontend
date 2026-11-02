/* eslint-disable @typescript-eslint/no-explicit-any */
import { wsManager } from '@/websocket/WsManager';
import type { AppDispatch } from '@/store/store';
import { syncCurrentPlayer } from '@/entities/player/model/syncCurrentPlayer';
import { navigationService } from '@/websocket/navigationService';
import {
  reset as resetGamePlayers,
  setAll as gameSetAll,
  removeByUserId,
  removeNotInLobby,
  setWaitingForPlayersEndTimestamp,
} from '@/entities/player/model/gamePlayerSlice';
import { normalizePlayers } from '@/websocket/registry/wsEventRegistry';
import { dispatchWithWsMeta } from '@/websocket/middleware/smartUpdateMiddleware';
import { updateSettingsFromServer } from '@/features/gameSettings/model/gameSettingsSlice';
import {
  setAll as setAllLobbyPlayers,
  setHostByUserId,
} from '@/entities/player/model/lobbyPlayerSlice';
import {
  setRoomPassword,
  setIsKicked,
} from '@/store/slices/lobby/lobbyUiSlice';
import { getUserId } from '@/entities/user/model/slice';
import { logEventReceived, recordMetric } from '@/websocket/utils/wsLogger';
import { showWarning } from '@/websocket/warningService';
import { resetCurrentPlayer } from '@/entities/player/model';
import { closeModal, openModal } from '@/store/modalSlice';

export type GameHandlerCtx = {
  dispatch: AppDispatch;
  getState: () => any;
  ws: typeof wsManager;
};

type CommonHandlersOptions = {
  /** Reset current game state slice (BJ/Fufl/etc.) */
  resetGameState: () => any;
  /** How to apply pause/resume into the game slice */
  onPause: () => any;
  onResume: () => any;
};

/**
 * Общие игровые handlers, которые применимы к любой игре и не должны дублироваться.
 * ВАЖНО: используйте их в конкретной группе игры (например `game:bj` / `game:fm`),
 * чтобы не держать две группы активными одновременно и не ловить коллизии по event-name.
 */
export function createGameCommonHandlers(opts: CommonHandlersOptions) {
  const { onPause, onResume, resetGameState } = opts;
  return {
    /** all_players: наполняем gamePlayers + syncCurrentPlayer */
    all_players({ dispatch, getState }: GameHandlerCtx, m: any) {
      logEventReceived('all_players', JSON.stringify(m).length);
      recordMetric('replaceAll');
      const players = Array.isArray(m?.players) ? m.players : [];
      dispatch(gameSetAll(players as any));
      dispatch(syncCurrentPlayer());
    },

    /** settings: снапшот настроек во время игры */
    settings({ dispatch, getState }: GameHandlerCtx, m: any) {
      logEventReceived('settings', JSON.stringify(m).length);
      const settings = m?.settings ?? null;
      const masterRoundSecond =
        m?.master_round_second != null
          ? Number(m.master_round_second)
          : undefined;
      if (!settings) return;
      dispatchWithWsMeta(
        dispatch,
        'settings',
        updateSettingsFromServer({
          ...settings,
          master_round_second: masterRoundSecond,
        }) as any,
      );
    },

    /** pause_game */
    pause_game({ dispatch, getState }: GameHandlerCtx, m: any) {
      logEventReceived('pause_game', JSON.stringify(m).length);
      dispatchWithWsMeta(dispatch, 'pause_game', onPause());
    },

    /** resume_game */
    resume_game({ dispatch, getState }: GameHandlerCtx, m: any) {
      logEventReceived('resume_game', JSON.stringify(m).length);
      dispatchWithWsMeta(dispatch, 'resume_game', onResume());
    },

    // ───────────────────────────────────────────────────────────────────────────
    // Lobby-related events that can happen during game
    // ───────────────────────────────────────────────────────────────────────────

    user_leave({ dispatch, getState, ws }: GameHandlerCtx, m: any) {
      logEventReceived('user_leave', JSON.stringify(m).length);
      recordMetric('replaceAll');

      const userId = getUserId(getState());
      const targetUserId =
        m?.user != null
          ? Number(m.user)
          : m?.user_id != null
            ? Number(m.user_id)
            : null;

      if (targetUserId != null) {
        dispatch(removeByUserId(targetUserId));
      }

      const players = Array.isArray(m?.players) ? m.players : [];
      if (players.length > 0) dispatch(setAllLobbyPlayers(players as any));
    },

    user_kick({ dispatch, getState, ws }: GameHandlerCtx, m: any) {
      logEventReceived('user_kick', JSON.stringify(m).length);
      recordMetric('replaceAll');

      const state = getState();
      const currentUserId = getUserId(state);
      const targetUserId =
        m?.user != null
          ? Number(m.user)
          : m?.user_id != null
            ? Number(m.user_id)
            : null;

      if (targetUserId != null && targetUserId > 0) {
        dispatch(removeByUserId(targetUserId));

        if (currentUserId && Number(currentUserId) === targetUserId) {
          sessionStorage.removeItem('currentGameId');
          sessionStorage.removeItem('currentGameType');
          dispatch(setIsKicked(true));
        }
      }

      const players = Array.isArray(m?.players) ? m.players : [];
      if (players.length > 0) {
        const normalized = normalizePlayers({ players });
        dispatch(setAllLobbyPlayers(normalized as any));
        dispatch(
          removeNotInLobby({
            lobbyPlayerIds: normalized.map(player => Number(player.id)),
            userIds: normalized.map(player => Number(player.user_id)),
          }),
        );
      }
    },

    user_kicked_message({ dispatch, getState }: GameHandlerCtx, m: any) {
      logEventReceived('user_kicked_message', JSON.stringify(m).length);
      sessionStorage.removeItem('currentGameId');
      sessionStorage.removeItem('currentGameType');
      dispatch(setIsKicked(true));
    },

    /**
     * user_kicked_self - Player was kicked from the room for inactivity (AFK)
     * Shows warning modal and redirects to lobby list
     */
    user_kicked_self: ({ dispatch, ws }: any, m: any) => {
      logEventReceived('user_kicked_self', JSON.stringify(m).length);
      sessionStorage.removeItem('currentGameId');
      sessionStorage.removeItem('currentGameType');
      ws.disconnect(1000, 'kicked');
      dispatch(setIsKicked(true));
    },

    /**
     * waiting_for_players - Game paused because player count dropped below required minimum (3)
     * Show waiting modal
     */
    waiting_for_players: ({ dispatch, getState }: GameHandlerCtx, m: any) => {
      logEventReceived('waiting_for_players', JSON.stringify(m).length);
      dispatch(setWaitingForPlayersEndTimestamp(m.end_timestamp));
      dispatch(openModal('modalWaitingForPlayers'));
    },

    /**
     * players_restored - Player count restored to required minimum after waiting_for_players
     * close waiting modal
     */
    players_restored({ dispatch, getState }: GameHandlerCtx, m: any) {
      logEventReceived('players_restored', JSON.stringify(m).length);
      dispatch(closeModal('modalWaitingForPlayers'));
      dispatch(openModal('modalPlayersRestored'));
    },

    user_join({ dispatch, getState }: GameHandlerCtx, m: any) {
      logEventReceived('user_join', JSON.stringify(m).length);
      recordMetric('replaceAll');
      const players = Array.isArray(m?.players)
        ? m.players
        : Array.isArray(m?.player)
          ? m.player
          : [];
      if (players.length > 0) dispatch(setAllLobbyPlayers(players as any));
    },

    change_host({ dispatch, getState }: GameHandlerCtx, m: any) {
      logEventReceived('change_host', JSON.stringify(m).length);
      recordMetric('replaceAll');
      const newHostUserId =
        m?.new_host_id ?? m?.new_host ?? m?.host_id ?? m?.user_id;
      if (newHostUserId != null) {
        dispatch(setHostByUserId(Number(newHostUserId)));
        dispatch(syncCurrentPlayer());
      }
      const players = Array.isArray(m?.players) ? m.players : [];
      if (players.length > 0) {
        dispatch(setAllLobbyPlayers(players as any));
        dispatch(syncCurrentPlayer());
      }
    },

    /**
     * exit_all_from_game: возврат всех игроков из игры в комнату
     * - Сбрасывает состояние текущей игры (BJ/Fufl)
     * - Очищает gamePlayers
     * - Обновляет lobbyPlayers и навигирует в лобби
     */
    exit_all_from_game({ dispatch, getState }: GameHandlerCtx, m: any) {
      logEventReceived('exit_all_from_game', JSON.stringify(m).length);
      recordMetric('replaceAll');

      sessionStorage.removeItem('currentGameId');
      sessionStorage.removeItem('currentGameType');

      dispatch(opts.resetGameState());
      dispatch(resetGamePlayers());

      const players = Array.isArray(m?.players) ? m.players : [];
      if (players.length > 0) {
        const normalized = normalizePlayers({ players });
        dispatchWithWsMeta(
          dispatch,
          'exit_all_from_game',
          setAllLobbyPlayers(normalized as any),
        );
        setTimeout(() => {
          dispatch(syncCurrentPlayer());
        }, 0);
      }

      const lobbyId =
        m?.room_id ||
        m?.room?.id ||
        (m?.players?.[0]?.room_id ? Number(m.players[0].room_id) : null);

      if (lobbyId) {
        navigationService.navigate(`/lobby/${lobbyId}`, {
          replace: true,
          state: { fromGame: true },
        });
      } else {
        navigationService.navigate('..', {
          replace: true,
          state: { fromGame: true },
        });
      }
    },

    /**
     * exit_from_all: хост распустил комнату прямо из игры
     * - Показывает модалку «Комната была распущена»
     * - По подтверждению сбрасывает состояние и навигирует на список комнат
     */
    exit_from_all({ dispatch }: GameHandlerCtx, m: any) {
      logEventReceived('exit_from_all', 0);

      sessionStorage.removeItem('currentGameId');
      sessionStorage.removeItem('currentGameType');

      showWarning({
        title: 'Комната распущена',
        text: 'Комната была распущена хостом. Вы вернётесь на главный экран.',
        redirectPath: '',
        onConfirm: () => {
          dispatch(opts.resetGameState());
          dispatch(resetGamePlayers());
          dispatch(resetCurrentPlayer());
          navigationService.navigate('/lobby', { replace: true });
        },
      });
    },
  } as const;
}
