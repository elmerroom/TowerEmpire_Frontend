/** Тайп-гарды без сторонних библиотек */
import { EV_START_GAME, EV_ALL_PLAYERS } from '@/entities/game/model';
import type { StartGameEvent, AllPlayersEvent } from '@/entities/game/model';

export function isStartGameEvent(m: unknown): m is StartGameEvent {
  const g = m as StartGameEvent;
  return (
    !!g &&
    (g as any).event === EV_START_GAME &&
    typeof g.start_game === 'boolean' &&
    typeof g.game_id === 'number' &&
    typeof g.timestamp === 'string'
  );
}

export function isAllPlayersEvent(m: unknown): m is AllPlayersEvent {
  const g = m as AllPlayersEvent;
  return !!g && (g as any).event === EV_ALL_PLAYERS && Array.isArray(g.players);
}
