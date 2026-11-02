import { z } from 'zod';
import { russianEmailSchema } from '@/shared/lib/validation';

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Минимум 3 символа')
    .max(15, 'Максимум 15 символов')
    .regex(/^[a-zA-Z0-9_а-яА-ЯёЁ]+$/, 'Только буквы, цифры и подчеркивания'),
  email: russianEmailSchema.nullable().or(z.literal('')),
  nickname_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Формат должен быть #RRGGBB')
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
