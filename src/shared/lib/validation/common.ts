import { z } from 'zod';

export const playerSchema = z.object({
  id: z.number().int().nonnegative(),
  user_id: z.number().int().nonnegative(),
  player_id: z.number().int().positive().optional(),
  name: z.string(),
  is_host: z.boolean(),
  is_guest: z.boolean(),
  is_disconnect: z.boolean(),
  points: z.number(),
  avatar: z.unknown().nullable().optional(),
  nickname_color: z.unknown().nullable().optional(),
  is_vip: z.boolean(),
  selected_cards: z.array(z.unknown()).optional(),
  exp: z.number().optional(),
  is_bot: z.boolean().optional(),
});

export const lobbySchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string(),
  is_private: z.boolean(),
  max_players: z.number().int().nonnegative(),
  game_name: z.string(),
  created_at: z.union([z.string(), z.number(), z.null()]).optional(),
});

export const gameSettingsSchema = z.object({
  player_round_second: z.number().int().positive().optional(),
  victory_points: z.number().int().positive().optional(),
  censorship: z.boolean().optional(),
  master_round_second: z.number().int().positive().optional(),
  count_card: z.number().int().positive().optional(),
  deck_size: z.number().int().positive().optional(),
});

export const interactionIdSchema = z.string().min(1);

export const interactionEnvelopeSchema = z.object({
  interactionId: interactionIdSchema.optional(),
  interaction_id: interactionIdSchema.optional(),
});

export type Player = z.infer<typeof playerSchema>;
export type Lobby = z.infer<typeof lobbySchema>;
export type GameSettings = z.infer<typeof gameSettingsSchema>;
