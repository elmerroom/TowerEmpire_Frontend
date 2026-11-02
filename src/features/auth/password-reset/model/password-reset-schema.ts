import { z } from 'zod';
import { russianEmailSchema } from '@/shared/lib/validation';

export const sendResetPasswordSchema = z.object({
  email: russianEmailSchema,
});

export type SendResetPasswordFormValues = z.infer<
  typeof sendResetPasswordSchema
>;

export const setNewPasswordSchema = z
  .object({
    code: z.string().min(1, 'Код обязателен'),
    password: z
      .string()
      .min(8, 'Минимум 8 символов')
      .max(15, 'Максимум 15 символов'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type SetNewPasswordFormValues = z.infer<typeof setNewPasswordSchema>;
