import { describe, expect, it } from 'vitest';
import {
  getInteractionIdFromPayload,
  validateIncomingWsMessage,
  validateWsEventPayload,
} from './websocket';

describe('websocket validation', () => {
  it('normalizes incoming messages with type field', () => {
    const result = validateIncomingWsMessage({
      type: 'user_join',
      players: [],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.event).toBe('user_join');
    }
  });

  it('rejects messages without event or type', () => {
    const result = validateIncomingWsMessage({
      players: [],
    });

    expect(result.success).toBe(false);
  });

  it('validates normalized player payload for registered events', () => {
    const result = validateWsEventPayload('user_join', [
      {
        id: 1,
        user_id: 2,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: null,
        is_vip: false,
        is_guest: false,
      },
    ]);

    expect(result.success).toBe(true);
  });

  it('validates normalized bot payload for bot_join event', () => {
    const result = validateWsEventPayload('bot_join', {
      id: 178,
      user_id: 178,
      name: 'CircuitSage',
      is_host: false,
      is_disconnect: false,
      points: 0,
      avatar: null,
      nickname_color: '#00FFFF',
      is_vip: false,
      is_bot: true,
      is_guest: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid normalized player payload', () => {
    const result = validateWsEventPayload('user_join', [
      {
        id: 'broken',
      },
    ]);

    expect(result.success).toBe(false);
  });

  it('extracts interaction id from either casing', () => {
    expect(getInteractionIdFromPayload({ interactionId: 'abc' })).toBe('abc');
    expect(getInteractionIdFromPayload({ interaction_id: 'xyz' })).toBe('xyz');
  });
});
