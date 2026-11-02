import { z } from 'zod';
import { russianEmailSchema } from '@/shared/lib/validation';

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Никнейм обязателен')
      .max(15, 'Не более 15 символов'),
    email: russianEmailSchema,
    password: z
      .string()
      .min(8, 'Минимум 8 символов')
      .max(15, 'Максимум 15 символов')
      .regex(
        /^[A-Za-z\d]+$/,
        'Только латинские буквы и цифры, без пробелов и символов',
      )
      .regex(/[a-z]/, 'Нужна хотя бы одна строчная буква')
      .regex(/[A-Z]/, 'Нужна хотя бы одна заглавная буква')
      .regex(/\d/, 'Нужна хотя бы одна цифра'),
    repeatPassword: z.string().min(1, 'Повторите пароль'),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'Необходимо согласие на обработку данных',
    }),
  })
  .refine(data => data.password === data.repeatPassword, {
    message: 'Пароли не совпадают',
    path: ['repeatPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
