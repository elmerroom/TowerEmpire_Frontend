/**
 * Маппинг backend ошибок → клиентские AuthError объекты.
 *
 * Источники ошибок:
 * - black_jokes/app/transports/handlers/users/exceptions.py
 * - black_jokes/app/services/user_service.py
 */
import { AuthError, AuthErrorAction, AuthErrorType } from './types';

type BackendErrorSignature = {
  httpStatus: number;
  detail?: string;
  message?: string;
  code?: string;
};

type ErrorRule = {
  type: AuthErrorType;
  action: AuthErrorAction;
  message: string;
};

/**
 * Правила маппинга по HTTP статусу + substring из detail/message.
 * Порядок важен: первое совпадение побеждает.
 */
const STATUS_RULES: Record<
  number,
  Array<{ match: string | RegExp; rule: ErrorRule }>
> = {
  400: [
    {
      match: /неправильный статус/i,
      rule: {
        type: AuthErrorType.invalid_status,
        action: AuthErrorAction.show_message,
        message: 'Неправильный статус аккаунта. Обратитесь в поддержку.',
      },
    },
    {
      match: /необходимо указать email и password/i,
      rule: {
        type: AuthErrorType.missing_credentials,
        action: AuthErrorAction.show_message,
        message: 'Укажите email и пароль.',
      },
    },
    {
      match: /неверно введен старый пароль/i,
      rule: {
        type: AuthErrorType.invalid_credentials,
        action: AuthErrorAction.show_message,
        message: 'Неверный старый пароль.',
      },
    },
    {
      match: /токен подтверждения не действителен/i,
      rule: {
        type: AuthErrorType.email_not_confirmed,
        action: AuthErrorAction.email_confirm,
        message: 'Срок действия токена истёк. Запросите новое письмо.',
      },
    },
  ],

  403: [
    {
      match: /подтверждени|почт|email|верификац/i,
      rule: {
        type: AuthErrorType.email_not_confirmed,
        action: AuthErrorAction.email_confirm,
        message:
          'Для авторизации требуется подтверждение почты по ссылке в письме.',
      },
    },
    {
      match: /.*/,
      rule: {
        type: AuthErrorType.email_not_confirmed,
        action: AuthErrorAction.email_confirm,
        message: 'Нет доступа. Подтвердите аккаунт.',
      },
    },
  ],

  404: [
    {
      match: /пользователь не найден|user.*not.*found/i,
      rule: {
        type: AuthErrorType.user_not_found,
        action: AuthErrorAction.show_message,
        message: 'Пользователь не найден. Проверьте email и попробуйте снова.',
      },
    },
    {
      match: /токен подтверждения не найден/i,
      rule: {
        type: AuthErrorType.email_not_confirmed,
        action: AuthErrorAction.email_confirm,
        message: 'Токен подтверждения не найден. Запросите новое письмо.',
      },
    },
    {
      match: /.*/,
      rule: {
        type: AuthErrorType.user_not_found,
        action: AuthErrorAction.show_message,
        message: 'Данные не найдены.',
      },
    },
  ],

  406: [
    {
      match: /активирован/i,
      rule: {
        type: AuthErrorType.already_active,
        action: AuthErrorAction.show_message,
        message: 'Ваш аккаунт уже активирован. Наслаждайтесь игрой!',
      },
    },
  ],

  409: [
    {
      match: /email/i,
      rule: {
        type: AuthErrorType.unknown,
        action: AuthErrorAction.show_message,
        message: 'Пользователь с таким email уже существует.',
      },
    },
    {
      match: /username/i,
      rule: {
        type: AuthErrorType.unknown,
        action: AuthErrorAction.show_message,
        message: 'Пользователь с таким username уже существует.',
      },
    },
  ],

  422: [
    {
      match: /неверный пароль|неверн.*парол|invalid.*password/i,
      rule: {
        type: AuthErrorType.invalid_credentials,
        action: AuthErrorAction.show_message,
        message: 'Неверный email или пароль.',
      },
    },
    {
      match: /старый и новый пароли совпадают/i,
      rule: {
        type: AuthErrorType.invalid_credentials,
        action: AuthErrorAction.show_message,
        message: 'Новый пароль не должен совпадать со старым.',
      },
    },
    {
      match: /файл не передан/i,
      rule: {
        type: AuthErrorType.unknown,
        action: AuthErrorAction.show_message,
        message: 'Файл не передан.',
      },
    },
    {
      match: /.*/,
      rule: {
        type: AuthErrorType.invalid_credentials,
        action: AuthErrorAction.show_message,
        message: 'Ошибка валидации. Проверьте введённые данные.',
      },
    },
  ],
};

/**
 * Дефолтные правила по HTTP статусу (если detail/message не совпали).
 */
const STATUS_DEFAULTS: Record<number, ErrorRule> = {
  400: {
    type: AuthErrorType.unknown,
    action: AuthErrorAction.show_message,
    message: 'Некорректный запрос.',
  },
  401: {
    type: AuthErrorType.session_expired,
    action: AuthErrorAction.reauth,
    message: 'Сессия истекла. Пожалуйста, войдите снова.',
  },
  403: {
    type: AuthErrorType.email_not_confirmed,
    action: AuthErrorAction.email_confirm,
    message: 'Нет доступа.',
  },
  404: {
    type: AuthErrorType.user_not_found,
    action: AuthErrorAction.show_message,
    message: 'Пользователь не найден.',
  },
  422: {
    type: AuthErrorType.invalid_credentials,
    action: AuthErrorAction.show_message,
    message: 'Ошибка валидации.',
  },
  429: {
    type: AuthErrorType.unknown,
    action: AuthErrorAction.show_message,
    message: 'Слишком много запросов. Попробуйте позже.',
  },
  500: {
    type: AuthErrorType.unknown,
    action: AuthErrorAction.server_error,
    message: 'Ошибка сервера. Попробуйте позже.',
  },
  502: {
    type: AuthErrorType.unknown,
    action: AuthErrorAction.server_error,
    message: 'Сервер временно недоступен.',
  },
  503: {
    type: AuthErrorType.unknown,
    action: AuthErrorAction.server_error,
    message: 'Сервер временно недоступен.',
  },
};

/**
 * Извлекает текст ошибки из любого формата RTK Query error.
 */
export function extractErrorText(error: BackendErrorSignature | unknown): {
  detail: string;
  message: string;
  code: string | undefined;
} {
  if (!error || typeof error !== 'object') {
    return { detail: '', message: '', code: undefined };
  }

  const obj = error as Record<string, unknown>;

  // RTK Query normalized error
  const detail = typeof obj.detail === 'string' ? obj.detail : '';
  const message = typeof obj.message === 'string' ? obj.message : '';
  const code = typeof obj.code === 'string' ? obj.code : undefined;

  // FastAPI validation errors (array of {loc, msg, type})
  if (Array.isArray(obj.detail)) {
    const msgs = (obj.detail as Array<{ msg?: string }>)
      .map(item => item.msg)
      .filter(Boolean);
    if (msgs.length > 0) {
      return { detail: msgs.join('; '), message, code };
    }
  }

  return { detail, message, code };
}

/**
 * Сопоставляет backend ошибку с правилом маппинга.
 */
export function matchErrorToRule(
  httpStatus: number,
  detail: string,
  message: string,
): ErrorRule | null {
  const textToMatch = detail || message;

  const rules = STATUS_RULES[httpStatus];
  if (rules) {
    for (const { match, rule } of rules) {
      if (match instanceof RegExp && match.test(textToMatch)) {
        return rule;
      }
    }
  }

  const defaultRule = STATUS_DEFAULTS[httpStatus];
  if (defaultRule) {
    return defaultRule;
  }

  return null;
}

/**
 * Создаёт AuthError из RTK Query error по правилам маппинга.
 */
export function createAuthErrorFromBackend(
  error: BackendErrorSignature,
): AuthError {
  const httpStatus = error.httpStatus || 0;
  const { detail, message, code } = extractErrorText(error);
  const rule = matchErrorToRule(httpStatus, detail, message);

  if (rule) {
    return {
      type: rule.type,
      action: rule.action,
      message: rule.message,
      httpStatus,
      originalError: error,
      code,
    };
  }

  // Fallback
  return {
    type: AuthErrorType.unknown,
    action: AuthErrorAction.show_message,
    message: detail || message || 'Произошла неизвестная ошибка.',
    httpStatus,
    originalError: error,
    code,
  };
}
