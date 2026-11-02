export interface UserPublicResponse {
  username: string;
  avatar: string | null;
  rank: RankResponse | null;
  date_joined: string;
  nickname_color: string;
  achievements: UserAchievementsResponse[];
}

export interface UserResponse {
  id: number;
  username: string;
  email: string | null;
  date_joined: string;
  avatar: string | null;
  dracoins: number;
  is_vip: boolean;
  its_vip_time: string | null;
  exp: number;
  rank: RankResponse | null;
  is_active: boolean;
  nickname_color: string;
  statistics: PlayerStatisticResponse[];
  achievements: UserAchievementsResponse[];
}

export interface UserUpdate {
  username?: string;
  email?: string;
  avatar?: string;
  nickname_color?: string;
}

export interface UpdatedUserResponse {
  username: string;
  email: string | null;
  avatar: string | null;
  nickname_color: string;
}

export interface RankResponse {
  name: string;
}

export interface PlayerStatisticResponse {
  id: number;
  game_name: string;
  total_game: number;
  won_game: number;
}

export interface UserAchievementsResponse {
  achievement: AchievementResponse;
  game_name: string;
  receiving_cond: string | null;
}

export interface AchievementResponse {
  name: string;
  desc: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}
export interface RefreshRequest {
  refresh: string;
}
export interface RefreshResponse {
  access: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginTempRequest {
  username: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  password_2: string;
}

export interface TempUserCreate {
  username: string;
}

export interface GenerateCode {
  email: string;
}

export interface RecoveryPassword {
  email: string;
  new_password: string;
  code: string;
}

export interface ResetPassword {
  old_password: string;
  new_password: string;
  code: string;
}

export interface TempTokenRequest {
  username: string;
}
export interface TokenPair {
  access: string;
  refresh: string;
}
