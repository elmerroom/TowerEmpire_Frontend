import { z } from 'zod';
import { gameSettingsSchema, lobbySchema, playerSchema } from './common';

const wsMessageEnvelopeSchema = z
  .object({
    event: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    interactionId: z.string().min(1).optional(),
    interaction_id: z.string().min(1).optional(),
  })
  .passthrough();

const playersSchema = z.array(playerSchema);

const normalizedGameBjRoundSchema = z.object({
  current_round: z.number().int().nonnegative(),
  master_id: z.number().int().nonnegative(),
  card: z.unknown().nullable(),
  players: playersSchema,
});

const normalizedWsEventSchemas: Record<string, z.ZodTypeAny> = {
  all_players: playersSchema,
  bot_join: playerSchema,
  change_settings: gameSettingsSchema,
  change_settings_fm: gameSettingsSchema,
  exit_all_from_game: playersSchema,
  lobby_state: lobbySchema,
  settings: gameSettingsSchema,
  start_round: normalizedGameBjRoundSchema,
  user_join: playersSchema,
  user_kick: playersSchema,
  user_leave: playersSchema,
};

type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map(issue => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
      return `${path}: ${issue.message}`;
    })
    .join('; ');

export const getInteractionIdFromPayload = (
  payload: unknown,
): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  const rawId = candidate.interactionId ?? candidate.interaction_id;

  return typeof rawId === 'string' && rawId.length > 0 ? rawId : null;
};

export const validateIncomingWsMessage = (
  payload: unknown,
): ValidationResult<Record<string, unknown>> => {
  const parsed = wsMessageEnvelopeSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      error: formatZodError(parsed.error),
    };
  }

  const event = parsed.data.event ?? parsed.data.type;
  if (!event) {
    return {
      success: false,
      error: 'missing event/type',
    };
  }

  return {
    success: true,
    data: parsed.data.event
      ? parsed.data
      : {
          ...parsed.data,
          event,
        },
  };
};

export const validateWsEventPayload = (
  event: string,
  payload: unknown,
): ValidationResult<unknown> => {
  const schema = normalizedWsEventSchemas[event];
  if (!schema) {
    return {
      success: true,
      data: payload,
    };
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: formatZodError(parsed.error),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
};
