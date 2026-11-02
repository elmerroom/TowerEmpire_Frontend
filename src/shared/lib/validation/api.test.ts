import { describe, expect, it } from 'vitest';
import {
  roomResponseListSchema,
  tokenPairSchema,
  userProfileSchema,
  validateApiResponse,
} from './api';

describe('api validation', () => {
  it('accepts valid token pair payload', () => {
    const result = validateApiResponse(
      tokenPairSchema,
      { access: 'a', refresh: 'b' },
      'auth/login',
    );

    expect(result.access).toBe('a');
    expect(result.refresh).toBe('b');
  });

  it('accepts valid lobby list payload', () => {
    const result = validateApiResponse(
      roomResponseListSchema,
      [
        {
          id: 1,
          max_players: 6,
          created_at: '2025-01-01T00:00:00Z',
          title: 'Room',
          game_name: 'Black_Jokes',
          players: [],
          is_private: false,
        },
      ],
      'lobby/getLobbies',
    );

    expect(result).toHaveLength(1);
  });

  it('accepts lobby list payload with bot players having null user_id', () => {
    const result = validateApiResponse(
      roomResponseListSchema,
      [
        {
          id: 1,
          max_players: 6,
          created_at: '2025-01-01T00:00:00Z',
          title: 'Room with Bot',
          game_name: 'Black_Jokes',
          players: [
            {
              id: 184,
              name: 'BinaryBard',
              user_id: null,
              room_id: 1,
              is_host: false,
              nickname_color: '#00FFFF',
              is_disconnect: false,
              avatar: null,
              is_vip: false,
            },
          ],
          is_private: false,
        },
      ],
      'lobby/getLobbies',
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.players[0]?.user_id).toBeNull();
  });

  it('throws on invalid user profile payload', () => {
    expect(() =>
      validateApiResponse(
        userProfileSchema,
        { id: 1, username: 'broken' },
        'user/getPersonalArea',
      ),
    ).toThrow(/Invalid API response/);
  });
});
