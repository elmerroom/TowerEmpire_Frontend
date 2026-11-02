export type KickTargetPlayer = {
  id: number;
  username: string;
  user_id?: number | null;
  player_id?: number | null;
};

export type KickTargetVariant = 'lobby' | 'game' | 'fufl' | 'hff';

type LobbyEntity = {
  id?: number;
  user_id?: number | null;
  name?: string;
};

type GameEntity = {
  id?: number;
  user_id?: number | null;
  player_id?: number | null;
  name?: string;
};

const IN_GAME_VARIANTS = new Set<KickTargetVariant>(['game', 'fufl', 'hff']);

const toPositiveId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
};

const findLobbyPlayer = (
  lobbyEntities: Record<string, LobbyEntity | undefined>,
  predicate: (entity: LobbyEntity) => boolean,
): number | null => {
  for (const entity of Object.values(lobbyEntities)) {
    if (!entity) continue;
    if (predicate(entity)) {
      return toPositiveId(entity.id);
    }
  }
  return null;
};

/**
 * Backend command `delete_user` expects lobby table id (`players.id`),
 * not the BJ/FM game-session player id.
 */
export const resolveKickLobbyPlayerId = (
  player: KickTargetPlayer,
  variant: KickTargetVariant,
  lobbyEntities: Record<string, LobbyEntity | undefined>,
  gameEntities: Record<string, GameEntity | undefined> = {},
): number | null => {
  const explicitLobbyId = toPositiveId(player.player_id);
  if (explicitLobbyId) {
    return explicitLobbyId;
  }

  if (!IN_GAME_VARIANTS.has(variant)) {
    const fromId = toPositiveId(player.id);
    if (fromId) {
      return fromId;
    }

    const byStoredId = toPositiveId(lobbyEntities[String(player.id)]?.id);
    if (byStoredId) {
      return byStoredId;
    }

    return findLobbyPlayer(
      lobbyEntities,
      entity => toPositiveId(entity.user_id) === toPositiveId(player.id),
    );
  }

  const gameEntity =
    gameEntities[String(player.id)] ??
    Object.values(gameEntities).find(entity => {
      const entityUserId = toPositiveId(entity?.user_id);
      const playerUserId = toPositiveId(player.user_id);
      return Boolean(
        entityUserId && playerUserId && entityUserId === playerUserId,
      );
    });

  const fromGameFk = toPositiveId(gameEntity?.player_id);
  if (fromGameFk) {
    return fromGameFk;
  }

  const userId =
    toPositiveId(player.user_id) ?? toPositiveId(gameEntity?.user_id);
  if (userId) {
    const byUserId = findLobbyPlayer(
      lobbyEntities,
      entity => toPositiveId(entity.user_id) === userId,
    );
    if (byUserId) {
      return byUserId;
    }
  }

  const username = player.username || gameEntity?.name;
  if (username) {
    return findLobbyPlayer(
      lobbyEntities,
      entity => String(entity.name ?? '') === String(username),
    );
  }

  return null;
};
