/**
 * Типы ошибок авторизации — единый словарь для всего приложения.
 * Используется AuthErrorHandler для классификации ошибок из RTK Query.
 */
export enum AuthErrorType {
  /** Неверный email или пароль */
  invalid_credentials = 'invalid_credentials',
  /** Email не подтверждён (требуется верификация) */
  email_not_confirmed = 'email_not_confirmed',
  /** Пользователь не найден */
  user_not_found = 'user_not_found',
  /** Сессия истекла (refresh не сработал) */
  session_expired = 'session_expired',
  /** Сетевая ошибка */
  network_error = 'network_error',
  /** Аккаунт уже активирован */
  already_active = 'already_active',
  /** Некорректный статус аккаунта */
  invalid_status = 'invalid_status',
  /** Отсутствуют учётные данные */
  missing_credentials = 'missing_credentials',
  /** Неизвестная ошибка */
  unknown = 'unknown',
}

/**
 * Действия, которые приложение должно выполнить после auth ошибки.
 */
export enum AuthErrorAction {
  /** Никаких действий — ошибка отображается локально в модалке */
  none = 'none',
  /** Показать сообщение в модалке (local toast) */
  show_message = 'show_message',
  /** Показать глобальное сообщение + кнопку «Отправить письмо повторно» */
  email_confirm = 'email_confirm',
  /** Разлогинить и перенаправить на логин */
  reauth = 'reauth',
  /** Показать глобальное сообщение «Попробуйте позже» (5xx) */
  server_error = 'server_error',
}

/**
 * Единый формат auth ошибки для Redux state и компонентов.
 */
export interface AuthError {
  /** Тип ошибки (для логики) */
  type: AuthErrorType;
  /** Требуемое действие (для UI) */
  action: AuthErrorAction;
  /** Сообщение для пользователя */
  message: string;
  /** HTTP статус ответа (если есть) */
  httpStatus?: number;
  /** Оригинальный объект ошибки (для отладки) */
  originalError?: unknown;
  /** Backend error code (если есть) */
  code?: string;
}
