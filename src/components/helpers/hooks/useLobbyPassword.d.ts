export declare function useLobbyPassword(): {
  get(lobbyId: number | string | null | undefined): string | null;
  set(lobbyId: number | string, password: string): void;
  clear(lobbyId: number | string): void;
};
