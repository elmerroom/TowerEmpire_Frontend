import { users } from './data';

// Универсальный матчтер для любой базы (любой домен/порт)
export const match = path => `*/${path}`;

// Простая генерация фейкового JWT (base64 payload)
export function makeJwt(userId) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ user_id: userId, iat: Date.now() }));
  return `${header}.${payload}.`;
}

export function getUserIdFromAuth(request) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const payloadPart = token.split('.')[1];
    const payload = JSON.parse(atob(payloadPart));
    return payload.user_id ?? payload.id ?? null;
  } catch {
    return null;
  }
}

export function findUserById(id) {
  return users.find(u => u.id === Number(id));
}

export function currentUser(request) {
  const id = getUserIdFromAuth(request);
  const found = users.find(u => u.id === id);
  return found || users[0]; // если нет токена — хост по умолчанию
}

// Нормализация настроек игры (при создании лобби)
export function normalizeSettings(raw = {}) {
  const src =
    raw.settings && typeof raw.settings === 'object' ? raw.settings : raw;

  const victory_points =
    src.victory_points ?? src.score_to_win ?? src.scoreToWin ?? 5;
  const player_round_second =
    src.player_round_second ?? src.round_time ?? src.roundTime ?? 60;
  const censorship =
    src.censorship ??
    (typeof src.censorship === 'boolean' ? src.censorship : true);
  const master_time = src.master_time ?? src.masterTime ?? 30;

  return {
    settings: {
      victory_points,
      player_round_second,
      censorship,
      master_time,
    },
  };
}
