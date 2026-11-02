import { getUserId } from '@/entities/user/model/slice';
import { selectGameStatus } from '@/entities/game/model/gameBjSlice';
import { selectAllLobbyPlayers } from './lobbyPlayerSlice';
import { selectAllGamePlayers } from './gamePlayerSlice';
import { setCurrentPlayer } from './currentPlayerSlice';
import type { AppDispatch, RootState } from '@/store/store';

/**
 * Centralized function to sync the current player.
 *
 * This thunk should be called after every player state update to ensure
 * the currentPlayer slice always contains the player data for the authenticated user.
 *
 * How it works:
 * 1. Gets the current user's ID from userSlice
 * 2. Searches the players Redux state for a player with matching user_id
 * 3. Sets that player as the current player (or null if not found)
 *
 * This approach is robust because:
 * - It always reads from Redux state (single source of truth)
 * - It doesn't rely on WebSocket event payloads which may contain data about OTHER players
 * - It works correctly for all scenarios: creating, joining, leaving, reconnecting
 */
export const syncCurrentPlayer =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const userId = getUserId(state);
    if (!userId) {
      dispatch(setCurrentPlayer({ player: null, context: 'none' }));
      return;
    }

    // Играем ли мы сейчас в какую-то игру?
    // - для BJ исторически это определяется через gameBj.status
    // - для других игр (например Fuflomicin) опираемся на gamePlayers.gameId (setGameMeta/reset)
    const isGame =
      selectGameStatus(state as any) === 'running' ||
      state.gamePlayers.gameId != null;
    if (isGame) {
      const gp =
        selectAllGamePlayers(state).find(p => p.user_id === userId) ?? null;
      const gameType = (state.gamePlayers.gameType ?? gp?.gameType ?? 'bj') as
        | 'bj'
        | 'fuf'
        | 'hff';
      dispatch(
        setCurrentPlayer({
          player: gp,
          context: gp ? gameType : gameType,
        }),
      );
      return;
    }
    const lp =
      selectAllLobbyPlayers(state).find(p => p.user_id === userId) ?? null;
    dispatch(
      setCurrentPlayer({ player: lp as any, context: lp ? 'lobby' : 'none' }),
    );
  };
