/**
 * Integration tests for smart update middleware
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { smartUpdateMiddleware } from './smartUpdateMiddleware';
import lobbyPlayersReducer from '@/entities/player/model/lobbyPlayerSlice';

// Mock logger to avoid console spam
vi.mock('../utils/wsLogger', () => ({
  logEventReceived: vi.fn(),
  logCompareResult: vi.fn(),
  logSkip: vi.fn(),
  logError: vi.fn(),
  recordMetric: vi.fn(),
  recordError: vi.fn(),
}));

type RootState = {
  lobbyPlayers: ReturnType<typeof lobbyPlayersReducer>;
};

describe('smartUpdateMiddleware - Integration', () => {
  let store: EnhancedStore<RootState>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        lobbyPlayers: lobbyPlayersReducer,
      },
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(smartUpdateMiddleware),
    });
  });

  it('should skip identical payload (0 updates)', () => {
    const players = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];

    // First dispatch - should update
    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players,
      meta: { wsEvent: 'user_join', timestamp: Date.now() },
    });

    const state1 = store.getState();
    expect(state1.lobbyPlayers.ids).toHaveLength(1);

    // Second dispatch with same data - should skip
    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players,
      meta: { wsEvent: 'user_join', timestamp: Date.now() },
    });

    const state2 = store.getState();
    // State reference should be same (no update)
    expect(state2.lobbyPlayers).toBe(state1.lobbyPlayers);
  });

  it('should update when payload changes (1 update)', () => {
    const players1 = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];

    const players2 = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: false,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];

    // First dispatch
    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players1,
      meta: { wsEvent: 'user_join', timestamp: Date.now() },
    });

    const state1 = store.getState();
    expect(state1.lobbyPlayers.entities[1]?.is_host).toBe(true);

    // Second dispatch with changed data
    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players2,
      meta: { wsEvent: 'change_host', timestamp: Date.now() },
    });

    const state2 = store.getState();
    expect(state2.lobbyPlayers.entities[1]?.is_host).toBe(false);
  });

  it('should handle player addition', () => {
    const players1 = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];

    const players2 = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
      {
        id: 2,
        user_id: 2,
        name: 'Bob',
        is_host: false,
        is_disconnect: false,
        points: 0,
        avatar: null,
        nickname_color: '#AAA',
        is_vip: false,
      },
    ];

    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players1,
      meta: { wsEvent: 'user_join', timestamp: Date.now() },
    });

    expect(store.getState().lobbyPlayers.ids).toHaveLength(1);

    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players2,
      meta: { wsEvent: 'user_join', timestamp: Date.now() },
    });

    expect(store.getState().lobbyPlayers.ids).toHaveLength(2);
  });

  it('should handle player removal', () => {
    const players1 = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
      {
        id: 2,
        user_id: 2,
        name: 'Bob',
        is_host: false,
        is_disconnect: false,
        points: 0,
        avatar: null,
        nickname_color: '#AAA',
        is_vip: false,
      },
    ];

    const players2 = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];

    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players1,
      meta: { wsEvent: 'user_join', timestamp: Date.now() },
    });

    expect(store.getState().lobbyPlayers.ids).toHaveLength(2);

    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players2,
      meta: { wsEvent: 'user_leave', timestamp: Date.now() },
    });

    expect(store.getState().lobbyPlayers.ids).toHaveLength(1);
  });

  it('should force update with skipCompare', () => {
    const players = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];

    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players,
      meta: { wsEvent: 'user_join', timestamp: Date.now() },
    });

    const state1 = store.getState();

    // Same payload but with skipCompare - should still dispatch
    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: players,
      meta: { wsEvent: 'user_join', timestamp: Date.now(), skipCompare: true },
    });

    const state2 = store.getState();
    // Even though data is same, state reference changed due to force update
    expect(state2.lobbyPlayers).not.toBe(state1.lobbyPlayers);
  });

  it('should handle bot_join with upsertOne', () => {
    const initialPlayers = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];

    // Set initial players
    store.dispatch({
      type: 'lobbyPlayers/setAll',
      payload: initialPlayers,
      meta: { wsEvent: 'user_join', timestamp: Date.now() },
    });

    expect(store.getState().lobbyPlayers.ids).toHaveLength(1);

    // Dispatch bot_join event
    store.dispatch({
      type: 'lobbyPlayers/upsertOne',
      payload: {
        bot: {
          id: 178,
          name: 'CircuitSage',
          user_id: null,
          is_host: false,
          is_disconnect: false,
          nickname_color: '#00FFFF',
          is_vip: false,
          is_bot: true,
        },
      },
      meta: { wsEvent: 'bot_join', timestamp: Date.now() },
    });

    const state = store.getState().lobbyPlayers;
    expect(state.ids).toHaveLength(2);
    expect(state.entities[178]?.name).toBe('CircuitSage');
    expect(state.entities[178]?.is_bot).toBe(true);
    expect(state.entities[178]?.user_id).toBe(178); // normalized from id because user_id was null
  });
});
