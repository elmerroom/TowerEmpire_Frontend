export type Rank = Readonly<{
  name: string;
}>;

type UserStatistic = Readonly<{
  id: number;
  gameName: string;
  totalGame: number;
  wonGame: number;
}>;

export type Achievement = Readonly<{
  name: string;
  description: string;
  gameName: string;
  receivingCondition?: string;
}>;

export type User = Readonly<{
  id: number;
  username: string;
  email: string | null;
  dateJoined: string;
  avatar?: string;
  dracoins: number;
  isVip: boolean;
  itsVipTime?: string;
  exp: number;
  rank?: Rank;
  isActive: boolean;
  nicknameColor: string;
  achievements?: ReadonlyArray<Achievement>;
  statistics?: ReadonlyArray<UserStatistic>;
}>;
