import { z } from 'zod';

const wsUrlSchema = z
  .string()
  .url()
  .refine(value => /^wss?:\/\//.test(value), {
    message: 'Expected ws:// or wss:// URL',
  });

const envSchema = z.object({
  MODE: z.string().default('development'),
  DEV: z.boolean().optional().default(false),
  PROD: z.boolean().optional().default(false),
  VITE_API_URL: z.string().url(),
  VITE_WS_URL: wsUrlSchema,
  VITE_WS_CHAT_URL: wsUrlSchema,
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map(issue => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = parsedEnv.data;
