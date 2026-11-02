import { z } from 'zod';
import { russianEmailSchema } from '@/shared/lib/validation';

export const loginSchema = z.object({
  email: russianEmailSchema,
  password: z.string().min(1, 'Пароль обязателен'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
