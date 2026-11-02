import { env } from './env';

const stripSlashes = (segment: string): string =>
  segment.replace(/^\/+|\/+$/g, '');
const withTrailingSlash = (value: string): string =>
  `${value.replace(/\/+$/, '')}/`;

export const apiBase = `${env.VITE_API_URL}/api`;
export const wsBase = env.VITE_WS_URL;
export const wsChatBase = env.VITE_WS_CHAT_URL;

export const path = (...parts: string[]): string =>
  [apiBase, ...parts.map(stripSlashes)].join('/');

const lobbyBase = withTrailingSlash(path('lobby'));

export const USERS = {
  token: withTrailingSlash(path('users', 'token')),
  tokenRefresh: withTrailingSlash(path('users', 'token', 'refresh')),
  personalArea: withTrailingSlash(path('users', 'personal_area')),
  create: withTrailingSlash(path('users', 'create')),
  createTemp: withTrailingSlash(path('users', 'create_temp')),
  generateCode: withTrailingSlash(path('users', 'generate_code')),
  accessEmail: withTrailingSlash(path('users', 'access_email')),
  recoveryPassword: withTrailingSlash(path('users', 'recovery_password')),
  update: withTrailingSlash(path('users', 'update')),
  delete: withTrailingSlash(path('users', 'delete')),
  uploadAvatar: (userId: string | number): string =>
    withTrailingSlash(path('users', String(userId), 'upload_avatar')),
  tokenTemp: withTrailingSlash(path('users', 'token_temp')),
  createAccessEmail: (token: string): string =>
    withTrailingSlash(path('users', 'create', 'access_email', token)),
  resetPassword: withTrailingSlash(path('users', 'reset_password')),
  players: (id: string | number): string =>
    withTrailingSlash(path('users', String(id), 'players')),
  detail: (id: string | number): string =>
    withTrailingSlash(path('users', String(id), 'detail')),
  achievements: (id: string | number): string =>
    withTrailingSlash(path('users', String(id), 'achievements')),
  nicknameColor: withTrailingSlash(path('users', 'nickname_color')),
  resendConfirmationEmail: withTrailingSlash(
    path('users', 'resend_confirmation_email'),
  ),
} as const;

export const LOBBY = {
  list: lobbyBase,
  create: lobbyBase,
  join: (id: string | number): string =>
    withTrailingSlash(path('lobby', String(id), 'join')),
} as const;
