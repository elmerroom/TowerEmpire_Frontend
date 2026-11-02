export interface Rank {
  name: string;
}

export interface AchievementDetail {
  name: string;
  desc: string;
}

export interface UserAchievement {
  achievement: AchievementDetail;
  game_name: string;
  receiving_cond: string | null;
}

export interface UserStatistic {
  id: number;
  game_name: string;
  total_game: number;
  won_game: number;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  dateJoined: string | null;
  dracoins: number;
  isVip: boolean;
  exp: number;
  isActive: boolean;
  nicknameColor: string;
  achievements: UserAchievement[];
  statistics: UserStatistic[];
  avatar?: string;
  itsVipTime?: string;
  rank?: Rank;
}
