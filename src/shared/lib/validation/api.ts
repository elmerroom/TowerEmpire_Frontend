import { z } from 'zod';
const rankSchema = z.object({
  name: z.string(),
});

const apiPlayerSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string(),
  user_id: z.number().int().nonnegative().nullable(),
  room_id: z.number().int().nonnegative(),
  is_host: z.boolean(),
  nickname_color: z.string(),
  is_disconnect: z.boolean(),
  avatar: z.string().nullable(),
  is_vip: z.boolean(),
});

const playerStatisticSchema = z.object({
  id: z.number().int().nonnegative(),
  game_name: z.string(),
  total_game: z.number().int().nonnegative(),
  won_game: z.number().int().nonnegative(),
});

const achievementDetailSchema = z.object({
  name: z.string(),
  desc: z.string(),
});

const userAchievementSchema = z.object({
  achievement: achievementDetailSchema,
  game_name: z.string(),
  receiving_cond: z.string().nullable(),
});

export const tokenPairSchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1),
});

export const refreshResponseSchema = z.object({
  access: z.string().min(1),
});

export const refreshTokenPayloadSchema = refreshResponseSchema.extend({
  refresh: z.string().min(1).optional(),
});

export const roomResponseSchema = z.object({
  id: z.number().int().nonnegative(),
  max_players: z.number().int().positive(),
  created_at: z.string(),
  title: z.string(),
  game_name: z.string(),
  players: z.array(apiPlayerSchema),
  is_private: z.boolean(),
});

export const roomResponseListSchema = z.array(roomResponseSchema);

export const roomCreateResponseSchema = roomResponseSchema;

export const userProfileSchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string(),
  email: z.string().email().nullable(),
  date_joined: z.string(),
  avatar: z.string().nullable(),
  dracoins: z.number().nonnegative(),
  is_vip: z.boolean(),
  its_vip_time: z.string().nullable(),
  exp: z.number().nonnegative(),
  rank: rankSchema.nullable(),
  is_active: z.boolean(),
  nickname_color: z.string(),
  statistics: z.array(playerStatisticSchema),
  achievements: z.array(userAchievementSchema),
});

export const updatedUserResponseSchema = z.object({
  username: z.string(),
  email: z.string().email().nullable(),
  avatar: z.string().nullable(),
  nickname_color: z.string(),
});

export const nickColorSchema = z.object({
  nickname_color: z.string(),
});

export const validateApiResponse = <T>(
  schema: z.ZodSchema<T>,
  payload: unknown,
  source: string,
): T => {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map(issue => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid API response for ${source}: ${details}`);
  }

  return parsed.data;
};
