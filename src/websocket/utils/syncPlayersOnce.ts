/* eslint-disable @typescript-eslint/no-explicit-any */

type UnknownDispatch = (action: unknown) => unknown;
type SetAllAction = (payload: any) => unknown;

type PlayerShape = {
  id?: number | string;
  user_id?: number | string;
  updated_at?: number | string;
  created_at?: number | string;
  is_host?: boolean;
  is_disconnect?: boolean;
  avatar?: string | null;
  name?: string;
  nickname_color?: string | null;
  is_vip?: boolean;
};

type PlayerFingerprint = readonly [
  number,
  number,
  string,
  string,
  number,
  number,
  string,
  string,
  number,
];

type PlayersSnapshot = {
  hash: string;
  emptyHits: number;
};

export type PlayersSnapshotRef = {
  current: PlayersSnapshot | null;
};

export type SyncPlayersOptions = {
  /**
   * Force dispatch even if the snapshot matches.
   */
  force?: boolean;
  /**
   * Number of consecutive "empty" calls before the snapshot is cleared.
   * Must be at least 1, defaults to 3.
   */
  clearDelay?: number;
  /**
   * Drop cached snapshot immediately.
   */
  reset?: boolean;
};

const DEFAULT_CLEAR_DELAY = 3;

const numberOrZero = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const booleanToInt = (value: unknown): 0 | 1 => (value ? 1 : 0);

const stringOrEmpty = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return String(value);
};

const fingerprintPlayers = (players: PlayerShape[]): PlayerFingerprint[] =>
  players
    .map<PlayerFingerprint>(item => {
      const id = numberOrZero(item?.id ?? item?.user_id);
      const userId = numberOrZero(item?.user_id);
      const updated =
        item?.updated_at ??
        item?.created_at ??
        `${booleanToInt(item?.is_host)}:${booleanToInt(item?.is_disconnect)}`;

      return [
        id,
        userId,
        stringOrEmpty(updated),
        stringOrEmpty(item?.name),
        booleanToInt(item?.is_host),
        booleanToInt(item?.is_disconnect),
        stringOrEmpty(item?.avatar),
        stringOrEmpty(item?.nickname_color),
        booleanToInt(item?.is_vip),
      ];
    })
    .sort((a, b) => a[0] - b[0]);

export function syncPlayersOnce(
  players: unknown,
  snapshotRef: PlayersSnapshotRef,
  dispatch: UnknownDispatch,
  setAll: SetAllAction,
  options?: SyncPlayersOptions,
): boolean {
  const clearDelay = Math.max(1, options?.clearDelay ?? DEFAULT_CLEAR_DELAY);

  if (options?.reset) {
    snapshotRef.current = null;
  }

  if (!Array.isArray(players)) {
    if (snapshotRef.current) {
      const nextHits = Math.min(clearDelay, snapshotRef.current.emptyHits + 1);
      if (nextHits >= clearDelay) {
        snapshotRef.current = null;
      } else {
        snapshotRef.current = {
          hash: snapshotRef.current.hash,
          emptyHits: nextHits,
        };
      }
    }
    return false;
  }

  const fingerprint = fingerprintPlayers(players as PlayerShape[]);
  const hash = JSON.stringify(fingerprint);

  const current = snapshotRef.current;

  if (!options?.force && current && current.hash === hash) {
    snapshotRef.current = { hash: current.hash, emptyHits: 0 };
    return false;
  }

  snapshotRef.current = { hash, emptyHits: 0 };
  dispatch(setAll(players));
  return true;
}
