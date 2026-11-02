import { z } from 'zod';

export const guestLoginSchema = z.object({
  username: z
    .string()
    .min(3, 'Никнейм должен содержать не менее 3 символов')
    .max(15, 'Максимум 15 символов')
    .regex(/^[a-zA-Zа-яА-Я0-9\s_]+$/, 'Неверный формат никнейма')
    .refine(
      val => val.trim().length > 0,
      'Никнейм не может состоять только из пробелов',
    ),
});

export type GuestLoginFormValues = z.infer<typeof guestLoginSchema>;
