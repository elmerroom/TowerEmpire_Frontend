import { z } from 'zod';

/**
 * Домены, явно указанные как разрешённые (используются в паре с проверкой
 * зоны .ru/.рф — большинство из них и так под неё попадают, но перечислены
 * для явности и на случай отдельных доменов вне зоны .ru, например vk.com).
 */
export const ALLOWED_EMAIL_DOMAINS = [
  'mail.ru',
  'bk.ru',
  'list.ru',
  'inbox.ru',
  'vk.com',
  'internet.ru',
  'xmail.ru',
  'yandex.ru',
  'ya.ru',
  'yandex.by',
  'yandex.kz',
  'yandex.uz',
  'yandex.com',
  'rambler.ru',
  'lenta.ru',
  'ro.ru',
  'myrambler.ru',
  'autorambler.ru',
  'mail.ru.net',
  'pochta.ru',
] as const;

// обнаружил проблему, что браузеры не видят нормально почту написанную частично
// на латинице, а частично на кирилице
// xn--p1ai — фиксированная punycode-форма домена .рф

const RU_TLD_REGEX = /\.(ru|рф|xn--p1ai)$/i;

const getEmailDomain = (email: string): string | null => {
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1 || atIndex === email.length - 1) return null;
  return email.slice(atIndex + 1).toLowerCase();
};

export const isAllowedEmailDomain = (email: string): boolean => {
  const domain = getEmailDomain(email);
  if (!domain) return false;

  return (
    RU_TLD_REGEX.test(domain) ||
    (ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(domain)
  );
};

export const RUSSIAN_EMAIL_ERROR = 'Используйте российские почтовые сервисы';

/**
 * Единая схема email для всех форм проекта: базовый формат и требование,
 * что домен относится к зоне .ru/.рф либо входит в список разрешённых
 * доменов российских почтовых сервисов.
 */
export const russianEmailSchema = z
  .string()
  .min(1, 'Email обязателен')
  // Базовый z.string().email() не пропускает нелатинские домены (например
  // .рф) — используем unicodeEmail, чтобы кириллические домены вообще
  // доходили до проверки isAllowedEmailDomain ниже.
  .check(
    z.email({
      pattern: z.regexes.unicodeEmail,
      error: 'Неверный формат email',
    }),
  )
  .refine(isAllowedEmailDomain, { message: RUSSIAN_EMAIL_ERROR });
