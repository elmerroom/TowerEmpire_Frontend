import type { components } from './types.gen';
import type {
  Achievement,
  Rank,
  User,
  UserStatistic,
} from '../../entities/user/model/types';
import type { LobbyData, Player } from '../../entities/lobby/model/types';

const mapRank = (
  rank: components['schemas']['RankResponse'] | null | undefined,
): Rank | undefined => {
  if (!rank) {
    return undefined;
  }

  return {
    name: rank.name,
  };
};

const mapUserAchievements = (
  achievements:
    | components['schemas']['UserAchievementsResponse'][]
    | null
    | undefined,
): Achievement[] =>
  (achievements ?? []).map(({ achievement, game_name, receiving_cond }) => ({
    name: achievement.name,
    description: achievement.desc,
    gameName: game_name,
    ...(receiving_cond ? { receivingCondition: receiving_cond } : {}),
  }));

const mapUserStatistics = (
  statistics:
    | components['schemas']['PlayerStatisticResponse'][]
    | null
    | undefined,
): UserStatistic[] =>
  (statistics ?? []).map(({ id, game_name, total_game, won_game }) => ({
    id,
    gameName: game_name,
    totalGame: total_game,
    wonGame: won_game,
  }));

const mapPlayerSchema = (
  player: components['schemas']['PlayerSchemaResponse'],
): Player => ({
  id: player.id,
  name: player.name,
  userId: player.user_id,
  roomId: player.room_id,
  isHost: player.is_host,
  nicknameColor: player.nickname_color,
  isDisconnected: player.is_disconnect,
  ...(player.avatar ? { avatar: player.avatar } : {}),
  isVip: player.is_vip,
});

export const mapPlayers = (
  players: components['schemas']['PlayerSchemaResponse'][] | null | undefined,
): Player[] => (players ?? []).map(mapPlayerSchema);

export const mapUserResponse = (
  dto: components['schemas']['UserResponse'],
): User => {
  const rank = mapRank(dto.rank);
  const achievements = mapUserAchievements(dto.achievements);
  const statistics = mapUserStatistics(dto.statistics);

  const user: User = {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    dateJoined: dto.date_joined,
    dracoins: dto.dracoins,
    isVip: dto.is_vip,
    exp: dto.exp,
    isActive: dto.is_active,
    nicknameColor: dto.nickname_color,
    achievements,
    statistics,
    ...(dto.avatar ? { avatar: dto.avatar } : {}),
    ...(dto.its_vip_time ? { itsVipTime: dto.its_vip_time } : {}),
    ...(rank ? { rank } : {}),
  };

  return user;
};

export const mapRoomResponse = (
  dto: components['schemas']['RoomResponse'],
): LobbyData => {
  const players = mapPlayers(dto.players);

  return {
    id: dto.id,
    maxPlayers: dto.max_players,
    createdAt: dto.created_at,
    title: dto.title,
    gameName: dto.game_name,
    players,
    isPrivate: dto.is_private,
  };
};
