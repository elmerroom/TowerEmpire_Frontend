export interface Player {
  id: number;
  name: string;
  userId: number;
  roomId: number;
  isHost: boolean;
  nicknameColor: string;
  isDisconnected: boolean;
  avatar?: string;
  isVip: boolean;
}

export interface LobbyData {
  id: number;
  maxPlayers: number;
  createdAt: string;
  title: string;
  gameName: string;
  players: Player[];
  isPrivate: boolean;
}
