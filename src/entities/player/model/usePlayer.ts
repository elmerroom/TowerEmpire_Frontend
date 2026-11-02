import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAllPlayers } from '@/store/slices/players/playersSlice';
import {
  selectHostUserId,
  selectCurrentLobbyId,
} from '@/store/slices/lobby/currentLobbySlice';
import { selectCurrentPlayerId } from '@/entities/player/model/currentPlayerSlice';

/** Унифицированная форма данных игрока под карточку */
export type UiPlayer = {
  id: number | string;
  user_id?: number | string;
  username: string;
  avatar?: string | null;
  nicknameColor?: string | undefined;
  isOffline?: boolean;
  isHost?: boolean;
  score?: number;
};

export function usePlayer(playerId: number | string) {
  const players = useSelector(selectAllPlayers) || [];
  const hostUserId = useSelector(selectHostUserId);
  const lobbyId = useSelector(selectCurrentLobbyId); // пригодится, чтобы мемуизация пересчиталась при смене комнаты
  const currentPlayerId = useSelector(selectCurrentPlayerId);

  const player = useMemo(() => {
    const p =
      players.find(
        (it: any) => it?.id === playerId || it?.user_id === playerId,
      ) ?? null;

    if (!p) return null;

    const username = p.name ?? 'Player';
    const nicknameColor = p.nickname_color ?? '#4eb5b5';
    const isOffline = Boolean(p.is_disconnect ?? p.is_disconnect ?? false);
    const pid = p.id ?? p.user_id;

    const isHost =
      hostUserId != null
        ? Number(p.user_id ?? p.id) === Number(hostUserId)
        : Boolean(p.is_host);

    const isCurrent = currentPlayerId != null && pid === currentPlayerId;

    const ui: UiPlayer = {
      id: pid,
      user_id: p.user_id,
      username,
      avatar: p.avatar,
      nicknameColor,
      isOffline,
      isHost,
      score: p.points, // Добавляем очки
    };

    return { ui, isCurrent };
  }, [players, playerId, hostUserId, currentPlayerId, lobbyId]);

  return player; // { ui, isCurrent } | null
}
