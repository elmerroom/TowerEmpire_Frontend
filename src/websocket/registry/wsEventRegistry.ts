/**
 * WS Event Registry - центральный реестр WS событий с метаданными
 * Task 1, 2, 3 из plan.json
 */

import type { RootState } from '@/store/store';
import { selectAllLobbyPlayers } from '@/entities/player/model/lobbyPlayerSlice';
import { selectAllGamePlayers } from '@/entities/player/model/gamePlayerSlice';
import { selectCurrentLobby } from '@/store/slices/lobby/currentLobbySlice';
import { selectGameBjState } from '@/entities/game/model/gameBjSlice';
import { getGameSettingsComparable } from '@/features/gameSettings/model/gameSettingsSlice';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type GameType = 'bj' | 'fm';
export type TargetSlice =
  | 'lobbyPlayers'
  | 'gamePlayers'
  | 'gameBj'
  | 'fuflGame'
  | 'currentLobby'
  | 'gameSettings';

const GAME_SLICE_MAP: Record<GameType, TargetSlice> = {
  bj: 'gameBj',
  fm: 'fuflGame',
};

type TargetSliceResolver<T> = (payload: T) => TargetSlice;

/**
 * Стратегии сравнения (порядок: fast → medium → fallback)
 * - fingerprint: быстрый хеш ключевых полей (O(n) для массивов)
 * - version: сравнение по version/updated_at поля
 * - deep: глубокое сравнение (fallback)
 * - always: всегда обновлять (без сравнения)
 */
export type CompareStrategy = 'fingerprint' | 'version' | 'deep' | 'always';

export interface WsEventMeta<P = unknown> {
  /** Имя события из WS payload (event поле) */
  event: string;
  /** Целевой slice для обновления */
  targetSlice: TargetSlice | TargetSliceResolver<P>;
  /** Стратегия сравнения для определения необходимости обновления */
  compareStrategy: CompareStrategy;
  /** Нормализатор payload в единый формат */
  normalizer?: (payload: P) => unknown;
  /** Селектор текущего состояния для сравнения */
  selector?: (state: RootState) => unknown;
  /** Поле ID для entity comparison */
  idField?: string;
  /** Поле версии для version comparison (updated_at, version, etc.) */
  versionField?: string;
  /** Описание события (для логов/документации) */
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizers
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Извлекает массив игроков из разных форм payload
 */
const extractPlayersArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.player)) return payload.player;
  if (Array.isArray(payload?.players)) return payload.players;
  if (Array.isArray(payload?.all_players_bj)) return payload.all_players_bj;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
};

/**
 * Нормализует игрока в единый формат
 */
const normalizePlayer = (p: any) => ({
  id: Number(p?.id ?? 0),
  user_id: Number(p?.user_id ?? p?.id ?? 0),
  player_id:
    p?.player_id != null && Number(p.player_id) > 0
      ? Number(p.player_id)
      : undefined,
  name: String(p?.name ?? ''),
  is_host: Boolean(p?.is_host),
  is_disconnect: Boolean(p?.is_disconnect),
  is_guest: Boolean(p?.is_guest),
  points: Number(p?.points ?? 0),
  avatar: p?.avatar ?? null,
  nickname_color: p?.nickname_color ?? null,
  is_vip: Boolean(p?.is_vip),
  selected_cards: Array.isArray(p?.selected_cards) ? p.selected_cards : [],
  exp: Number(p?.exp ?? 0),
  is_bot: Boolean(p?.is_bot),
});

/**
 * Нормализует payload бота в единый формат LobbyPlayer
 */
export const normalizeBotPayload = (payload: any) => {
  const bot = payload?.bot ?? payload;
  return normalizePlayer(bot);
};

/**
 * Нормализует массив игроков
 */
export const normalizePlayers = (payload: any): any[] => {
  const players = extractPlayersArray(payload);
  return players.map(normalizePlayer);
};

/**
 * Нормализует данные лобби
 */
export const normalizeLobby = (payload: any) => {
  const room = payload?.room ?? payload;
  if (!room || typeof room !== 'object') return null;

  return {
    id: Number(room.id ?? 0),
    title: String(room.title ?? room.name ?? ''),
    is_private: Boolean(room.is_private),
    max_players: Number(room.max_players ?? 0),
    game_name: String(room.game_name ?? ''),
    created_at: room.created_at ?? '',
  };
};

/**
 * Нормализует игровые настройки
 */
export const normalizeGameSettings = (payload: any) => {
  const settings =
    payload?.settings ??
    payload?.new_settings ??
    payload?.game_settings ??
    payload;
  if (!settings || typeof settings !== 'object') return null;

  return {
    player_round_second: settings.player_round_second ?? undefined,
    victory_points: settings.victory_points ?? undefined,
    censorship: settings.censorship ?? undefined,
    master_round_second:
      settings.master_round_second ?? payload?.master_round_second ?? undefined,
    count_card: settings.count_card ?? undefined,
    deck_size: settings.deck_size ?? undefined,
  };
};

/**
 * Нормализует данные игры BJ (start_round)
 */
export const normalizeGameBjRound = (payload: any) => ({
  current_round: Number(payload?.current_round ?? 0),
  master_id: Number(payload?.master_id ?? 0),
  card: payload?.card ?? null,
  players: normalizePlayers(payload),
});

// ─────────────────────────────────────────────────────────────────────────────
// Event Registry
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Центральный реестр WS событий
 * eventType → metadata для middleware
 */
export const wsEventRegistry: Record<string, WsEventMeta> = {
  // ─── Lobby Events ───────────────────────────────────────────────────────────
  user_join: {
    event: 'user_join',
    targetSlice: 'lobbyPlayers',
    compareStrategy: 'fingerprint',
    normalizer: normalizePlayers,
    selector: selectAllLobbyPlayers,
    idField: 'id',
    description: 'Игрок присоединился к лобби',
  },

  bot_join: {
    event: 'bot_join',
    targetSlice: 'lobbyPlayers',
    compareStrategy: 'always',
    normalizer: normalizeBotPayload,
    description: 'Бот присоединился к лобби',
  },

  user_leave: {
    event: 'user_leave',
    targetSlice: 'lobbyPlayers',
    compareStrategy: 'fingerprint',
    normalizer: normalizePlayers,
    selector: selectAllLobbyPlayers,
    idField: 'id',
    description: 'Игрок покинул лобби',
  },

  user_kick: {
    event: 'user_kick',
    targetSlice: 'lobbyPlayers',
    compareStrategy: 'fingerprint',
    normalizer: normalizePlayers,
    selector: selectAllLobbyPlayers,
    idField: 'id',
    description: 'Игрок исключён из лобби',
  },

  all_players: {
    event: 'all_players',
    targetSlice: 'gamePlayers',
    compareStrategy: 'fingerprint',
    normalizer: normalizePlayers,
    selector: selectAllGamePlayers,
    idField: 'id',
    description: 'Полный список игроков',
  },

  lobby_state: {
    event: 'lobby_state',
    targetSlice: 'currentLobby',
    compareStrategy: 'deep',
    normalizer: normalizeLobby,
    selector: selectCurrentLobby,
    description: 'Состояние лобби',
  },

  change_host: {
    event: 'change_host',
    targetSlice: 'currentLobby',
    compareStrategy: 'always', // Всегда применять - критично для UX
    description: 'Смена хоста',
  },

  change_private: {
    event: 'change_private',
    targetSlice: 'currentLobby',
    compareStrategy: 'always',
    description: 'Изменение приватности',
  },

  change_max_players: {
    event: 'change_max_players',
    targetSlice: 'currentLobby',
    compareStrategy: 'always',
    description: 'Изменение лимита игроков',
  },

  change_settings: {
    event: 'change_settings',
    targetSlice: 'gameSettings',
    compareStrategy: 'deep',
    normalizer: normalizeGameSettings,
    selector: getGameSettingsComparable,
    description: 'Изменение настроек игры',
  },

  change_settings_fm: {
    event: 'change_settings_fm',
    targetSlice: 'gameSettings',
    compareStrategy: 'deep',
    normalizer: normalizeGameSettings,
    selector: getGameSettingsComparable,
    description: 'Изменение настроек игры Fuflomicin',
  },

  settings: {
    event: 'settings',
    targetSlice: 'gameSettings',
    compareStrategy: 'deep',
    normalizer: normalizeGameSettings,
    selector: getGameSettingsComparable,
    description: 'Настройки игры',
  },

  pre_start_game: {
    event: 'pre_start_game',
    targetSlice: 'currentLobby',
    compareStrategy: 'always',
    description: 'Сообщение при старте игры',
  },

  pre_start: {
    event: 'pre_start',
    targetSlice: 'currentLobby',
    compareStrategy: 'always',
    description: 'Сообщение при старте (альтернативное имя)',
  },

  // ─── Game BJ Events ─────────────────────────────────────────────────────────
  start_game: {
    event: 'start_game',
    targetSlice: 'gameBj',
    compareStrategy: 'always', // Критичное событие - всегда применять
    description: 'Старт игры BJ',
  },

  start_round: {
    event: 'start_round',
    targetSlice: 'gameBj',
    compareStrategy: 'version',
    normalizer: normalizeGameBjRound,
    selector: selectGameBjState,
    versionField: 'current_round',
    description: 'Старт раунда BJ',
  },

  card_selection: {
    event: 'card_selection',
    targetSlice: 'gameBj',
    compareStrategy: 'always', // Counter всегда меняется
    description: 'Выбор карты игроком',
  },

  master_selected_cards: {
    event: 'master_selected_cards',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Мастер выбрал карту',
  },

  show_selected_cards: {
    event: 'show_selected_cards',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Показ выбранных карт',
  },

  start_phase_player_choice_card: {
    event: 'start_phase_player_choice_card',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Начало фазы выбора игрока',
  },

  end_phase_player_choice_card: {
    event: 'end_phase_player_choice_card',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Конец фазы выбора игрока',
  },

  start_phase_master_choice: {
    event: 'start_phase_master_choice',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Начало фазы выбора мастера',
  },

  end_phase_master_choice: {
    event: 'end_phase_master_choice',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Конец фазы выбора мастера',
  },

  finish_game: {
    event: 'finish_game',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Конец игры',
  },

  player_reconnection: {
    event: 'player_reconnection',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Переподключение игрока',
  },
  all_selected_player_card: {
    event: 'all_selected_player_card',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Все игроки ответили',
  },

  // ─── Pause Events ───────────────────────────────────────────────────────────
  pause_game: {
    event: 'pause_game',
    targetSlice: (payload: any) => {
      const gameType = payload?.game_type as GameType;
      return GAME_SLICE_MAP[gameType];
    },
    compareStrategy: 'always',
    description: 'Пауза игры',
  },

  resume_game: {
    event: 'resume_game',
    targetSlice: (payload: any) => {
      const gameType = payload?.game_type as GameType;
      return GAME_SLICE_MAP[gameType];
    },
    compareStrategy: 'always',
    description: 'Возобновление игры',
  },

  // ─── Exit Events ────────────────────────────────────────────────────────────
  exit_from_all: {
    event: 'exit_from_all',
    targetSlice: 'currentLobby',
    compareStrategy: 'always',
    description: 'Удаление лобби',
  },

  exit_all_from_game: {
    event: 'exit_all_from_game',
    targetSlice: 'lobbyPlayers',
    compareStrategy: 'fingerprint',
    normalizer: normalizePlayers,
    selector: selectAllLobbyPlayers,
    description: 'Возврат в лобби из игры',
  },

  commentator: {
    event: 'commentator',
    targetSlice: 'gameBj',
    compareStrategy: 'always',
    description: 'Сообщение комментатора',
  },

  // ─── Warning Events ────────────────────────────────────────────────────────────
  warning_message_about_delete_room: {
    event: 'warning_message_about_delete_room',
    targetSlice: 'currentLobby',
    compareStrategy: 'always',
    description: 'Предупреждение об удалении комнаты',
  },

  room_delete_warning_message: {
    event: 'room_delete_warning_message',
    targetSlice: 'currentLobby',
    compareStrategy: 'always',
    description: 'Сообщение об удалении комнаты',
  },

  // ─── Fuflomicin Events ──────────────────────────────────────────────────────
  start_round_fm: {
    event: 'start_round_fm',
    targetSlice: 'fuflGame',
    compareStrategy: 'always',
    description: 'Старт раунда Fuflomicin',
  },

  card_selection_fm: {
    event: 'card_selection_fm',
    targetSlice: 'fuflGame',
    compareStrategy: 'always',
    description: 'Выбор карты игроком в Fuflomicin',
  },

  end_phase_master_choice_fm: {
    event: 'end_phase_master_choice_fm',
    targetSlice: 'fuflGame',
    compareStrategy: 'always',
    description: 'Конец фазы выбора мастера в Fuflomicin',
  },

  finish_game_fm: {
    event: 'finish_game_fm',
    targetSlice: 'fuflGame',
    compareStrategy: 'always',
    description: 'Конец игры Fuflomicin',
  },

  send_prepositions_for_fm: {
    event: 'send_prepositions_for_fm',
    targetSlice: 'fuflGame',
    compareStrategy: 'always',
    description: 'Предлоги для игры Fuflomicin',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Получить метаданные события по имени
 */
export const getEventMeta = (eventType: string): WsEventMeta | null => {
  return wsEventRegistry[eventType] ?? null;
};

/**
 * Проверить, зарегистрировано ли событие
 */
export const isEventRegistered = (eventType: string): boolean => {
  return eventType in wsEventRegistry;
};

/**
 * Получить все события для определённого slice
 */
export const getEventsForSlice = (slice: TargetSlice): WsEventMeta[] => {
  return Object.values(wsEventRegistry).filter(e => e.targetSlice === slice);
};
