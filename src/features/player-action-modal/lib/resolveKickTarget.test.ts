import { describe, expect, it } from 'vitest';
import { resolveKickLobbyPlayerId } from './resolveKickTarget';

const lobbyEntities = {
  '10': { id: 10, user_id: 100, name: 'Host' },
  '11': { id: 11, user_id: 200, name: 'Alice' },
  '12': { id: 12, user_id: null, name: 'CircuitSage' },
};

const gameEntities = {
  '501': { id: 501, user_id: 200, player_id: 11, name: 'Alice' },
  '502': { id: 502, user_id: null, player_id: 12, name: 'CircuitSage' },
};

describe('resolveKickLobbyPlayerId', () => {
  it('uses lobby player id in lobby variant', () => {
    expect(
      resolveKickLobbyPlayerId(
        { id: 11, username: 'Alice', user_id: 200 },
        'lobby',
        lobbyEntities,
      ),
    ).toBe(11);
  });

  it('prefers explicit player_id from game payload', () => {
    expect(
      resolveKickLobbyPlayerId(
        { id: 501, username: 'Alice', user_id: 200, player_id: 11 },
        'game',
        lobbyEntities,
        gameEntities,
      ),
    ).toBe(11);
  });

  it('maps in-game human by game entity player_id', () => {
    expect(
      resolveKickLobbyPlayerId(
        { id: 501, username: 'Alice', user_id: 200 },
        'fufl',
        lobbyEntities,
        gameEntities,
      ),
    ).toBe(11);
  });

  it('maps in-game bot by lobby name when user_id is missing', () => {
    expect(
      resolveKickLobbyPlayerId(
        { id: 502, username: 'CircuitSage' },
        'hff',
        lobbyEntities,
        {},
      ),
    ).toBe(12);
  });

  it('returns null when in-game player cannot be mapped', () => {
    expect(
      resolveKickLobbyPlayerId(
        { id: 999, username: 'Unknown' },
        'game',
        lobbyEntities,
        {},
      ),
    ).toBeNull();
  });
});
