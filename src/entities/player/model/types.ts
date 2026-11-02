export type LobbyPlayer = {
  id: number;
  user_id: number;
  name: string;
  is_host: boolean;
  is_disconnect: boolean;
  is_guest: boolean;
  avatar: any | null;
  is_vip: boolean;
  nickname_color: string | null;
  exp: number;
  is_bot?: boolean;
};

export type GameType = 'bj' | 'fuf' | 'hff';

export type GamePlayer = {
  id: number;
  user_id: number;
  player_id?: number;
  name: string;
  points: number;
  is_disconnect: boolean;
  avatar: any | null;
  is_vip: boolean;
  nickname_color: string | null;
  gameType: GameType | null;
  gameId: number | null;
  selected_cards?: any[];
  exp: number;
};
