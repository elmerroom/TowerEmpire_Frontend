import { selectAllPlayers } from './playersSlice';

// Упорядочиваем игроков комнаты по времени их присоединения.
export const getSortedPlayersByJoinTime = state => {
  const players = selectAllPlayers(state) || [];

  // Сортируем копию массива, чтобы не мутировать источник.
  return [...players].sort((a, b) => {
    if (!a?.joined_at) return 1;
    if (!b?.joined_at) return -1;
    return new Date(a.joined_at) - new Date(b.joined_at);
  });
};
