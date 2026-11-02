export type Player = {
  id: number;
  user_id: number;
  name: string;
  is_host: boolean;
  is_disconnect: boolean;
  avatar: string | null;
  room_id?: number;
  points?: number;
  nickname_color?: string;
  is_vip?: boolean;
};

export type LobbyMeta = {
  id: number;
  title: string;
  is_private: boolean;
  game_name: string;
  max_players: number;
  created_at: string;
};
