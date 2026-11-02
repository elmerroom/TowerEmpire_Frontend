/**
 * AuthErrorHandler — единый обработчик ошибок авторизации.
 *
 * Содержит статические методы (чистые функции) для:
 * - Извлечения сообщения из любого формата ошибки
 * - Классификации типа ошибки
 * - Определения требуемого действия от пользователя
 * - Построения единого AuthError объекта
 *
 * Интегрируется с:
 * - baseQueryWithReauth.ts (dispatch в Redux)
 * - useAuth hook (обработка ошибок signIn/reAuth)
 * - Компоненты модальных окон (отображение ошибок)
 */
import { AuthError, AuthErrorAction, AuthErrorType } from './types';
import { createAuthErrorFromBackend, extractErrorText } from './constants';

/** Проверяет, что значение — объект с нужными полями */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** RTK Query error shape */
interface RTKError {
  status?: number;
  data?: unknown;
  error?: string;
  message?: string;
  code?: string;
  original?: unknown;
}

function isRTKError(error: unknown): error is RTKError {
  return (
    isObject(error) &&
    ('status' in error || 'data' in error || 'error' in error)
  );
}

export class AuthErrorHandler {
  /**
   * Извлекает пользовательское сообщение из любого формата ошибки.
   *
   * Цепочка извлечения (приоритет):
   * 1. error.message (нормализованное из baseQueryWithReauth)
   * 2. error.data.detail (FastAPI format)
   * 3. error.data.message (альтернатива)
   * 4. error.data.error (legacy format)
   * 5. error.error (string error)
   * 6. Fallback сообщение
   */
  static extractMessage(error: unknown): string {
    if (!error) {
      return 'Произошла неизвестная ошибка.';
    }

    // Network error (TypeError: Failed to fetch)
    if (error instanceof TypeError) {
      return 'Ошибка сети. Проверьте подключение к интернету.';
    }

    // Standard JS Error
    if (error instanceof Error) {
      return error.message || 'Произошла ошибка.';
    }

    if (!isObject(error)) {
      return String(error) || 'Произошла неизвестная ошибка.';
    }

    const obj = error as Record<string, unknown>;

    // 1. Normalized message (from baseQueryWithReauth)
    if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
      return obj.message;
    }

    // 2. FastAPI detail
    if (typeof obj.detail === 'string' && obj.detail.trim().length > 0) {
      return obj.detail;
    }

    // 3. data.detail (RTK Query wrapped)
    if (isObject(obj.data)) {
      const data = obj.data as Record<string, unknown>;

      if (typeof data.detail === 'string' && data.detail.trim().length > 0) {
        return data.detail;
      }

      if (typeof data.message === 'string' && data.message.trim().length > 0) {
        return data.message;
      }

      if (typeof data.error === 'string' && data.error.trim().length > 0) {
        return data.error;
      }

      // FastAPI validation errors: [{loc, msg, type}]
      if (Array.isArray(data.detail)) {
        const msgs = (data.detail as Array<{ msg?: string }>)
          .map(item => item.msg)
          .filter(Boolean);
        if (msgs.length > 0) {
          return msgs.join('; ');
        }
      }
    }

    // 4. Direct error string
    if (typeof obj.error === 'string' && obj.error.trim().length > 0) {
      return obj.error;
    }

    return 'Произошла неизвестная ошибка.';
  }

  /**
   * Определяет тип auth ошибки.
   */
  static classifyError(error: unknown): AuthErrorType {
    if (!error) return AuthErrorType.unknown;

    // Network error
    if (error instanceof TypeError) {
      return AuthErrorType.network_error;
    }

    if (!isRTKError(error)) {
      return AuthErrorType.unknown;
    }

    const status = error.status;

    // Правильно извлекаем detail/data из RTK error
    let textToMatch = '';
    const data = error.data as Record<string, unknown> | undefined;

    if (typeof (error as RTKError).data === 'object' && data) {
      // FastAPI detail
      if (typeof data.detail === 'string') {
        textToMatch = data.detail.toLowerCase();
      } else if (typeof data.message === 'string') {
        textToMatch = data.message.toLowerCase();
      } else if (typeof data.error === 'string') {
        textToMatch = data.error.toLowerCase();
      }
    } else if (typeof error.data === 'string') {
      textToMatch = error.data.toLowerCase();
    }

    // Также проверяем error.message (normalized)
    if (!textToMatch && typeof error.message === 'string') {
      textToMatch = error.message.toLowerCase();
    }

    // Status-based classification
    if (status === 403) {
      if (
        textToMatch.includes('почт') ||
        textToMatch.includes('подтвержд') ||
        textToMatch.includes('email')
      ) {
        return AuthErrorType.email_not_confirmed;
      }
      return AuthErrorType.email_not_confirmed;
    }

    if (status === 404) {
      if (textToMatch.includes('токен') || textToMatch.includes('token')) {
        return AuthErrorType.email_not_confirmed;
      }
      return AuthErrorType.user_not_found;
    }

    if (status === 401) {
      return AuthErrorType.session_expired;
    }

    if (status === 422) {
      if (textToMatch.includes('парол')) {
        return AuthErrorType.invalid_credentials;
      }
      return AuthErrorType.invalid_credentials;
    }

    if (status === 406) {
      return AuthErrorType.already_active;
    }

    if (status === 400) {
      if (textToMatch.includes('статус')) {
        return AuthErrorType.invalid_status;
      }
      if (textToMatch.includes('email') && textToMatch.includes('password')) {
        return AuthErrorType.missing_credentials;
      }
    }

    // Check if it's a network-level error
    if (error.error === 'FETCH_ERROR' || !status) {
      return AuthErrorType.network_error;
    }

    return AuthErrorType.unknown;
  }

  /**
   * Определяет требуемое действие от пользователя.
   */
  static getRequiredAction(error: unknown): AuthErrorAction {
    const type = AuthErrorHandler.classifyError(error);

    switch (type) {
      case AuthErrorType.email_not_confirmed:
        return AuthErrorAction.email_confirm;
      case AuthErrorType.session_expired:
        return AuthErrorAction.reauth;
      case AuthErrorType.user_not_found:
      case AuthErrorType.invalid_credentials:
      case AuthErrorType.already_active:
      case AuthErrorType.invalid_status:
      case AuthErrorType.missing_credentials:
        return AuthErrorAction.show_message;
      case AuthErrorType.network_error:
        return AuthErrorAction.show_message;
      default:
        // 5xx → server_error
        if (isRTKError(error) && error.status && error.status >= 500) {
          return AuthErrorAction.server_error;
        }
        return AuthErrorAction.show_message;
    }
  }

  /**
   * Строит полный AuthError объект из любого формата ошибки.
   * Главный метод для использования в компонентах.
   */
  static buildAuthError(error: unknown): AuthError {
    if (!error) {
      return {
        type: AuthErrorType.unknown,
        action: AuthErrorAction.show_message,
        message: 'Произошла неизвестная ошибка.',
        originalError: error,
      };
    }

    // Network error
    if (error instanceof TypeError) {
      return {
        type: AuthErrorType.network_error,
        action: AuthErrorAction.show_message,
        message: 'Ошибка сети. Проверьте подключение к интернету.',
        originalError: error,
      };
    }

    // If it already is our AuthError — return as is
    if (
      isObject(error) &&
      'type' in error &&
      'action' in error &&
      'message' in error
    ) {
      return error as unknown as AuthError;
    }

    // RTK Query error with status → use constants mapping
    if (isRTKError(error) && error.status) {
      return createAuthErrorFromBackend({
        httpStatus: error.status,
        detail:
          typeof (error.data as Record<string, unknown>)?.detail === 'string'
            ? ((error.data as Record<string, unknown>).detail as string)
            : undefined,
        message: error.message || error.error,
        code: error.code,
      });
    }

    // Standard JS Error
    if (error instanceof Error) {
      return {
        type: AuthErrorHandler.classifyError(error),
        action: AuthErrorHandler.getRequiredAction(error),
        message: error.message || 'Произошла ошибка.',
        originalError: error,
      };
    }

    // Fallback — извлекаем что можем
    return {
      type: AuthErrorType.unknown,
      action: AuthErrorHandler.getRequiredAction(error),
      message: AuthErrorHandler.extractMessage(error),
      originalError: error,
    };
  }

  /**
   * Проверяет, нужно ли показать глобальный тостер.
   * Локальные ошибки (invalid_credentials) — только в модалке.
   * Глобальные (session_expired, server_error) — везде.
   */
  static shouldShowGlobalToast(error: unknown): boolean {
    const action = AuthErrorHandler.getRequiredAction(error);
    return (
      action === AuthErrorAction.reauth ||
      action === AuthErrorAction.server_error
    );
  }

  /**
   * Проверяет, является ли ошибка ошибкой неподтверждённого email.
   * Удобный helper для компонентов.
   */
  static isEmailNotConfirmedError(error: unknown): boolean {
    return (
      AuthErrorHandler.classifyError(error) ===
      AuthErrorType.email_not_confirmed
    );
  }
}
