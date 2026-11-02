import { describe, it, expect } from 'vitest';
import { AuthErrorHandler } from './auth-error-handler';
import { AuthErrorType, AuthErrorAction } from './types';

describe('AuthErrorHandler', () => {
  describe('extractMessage', () => {
    it('извлекает message из normalized error', () => {
      const error = { status: 403, message: 'Подтвердите email' };
      expect(AuthErrorHandler.extractMessage(error)).toBe('Подтвердите email');
    });

    it('извлекает detail из data.detail (FastAPI format)', () => {
      const error = { status: 422, data: { detail: 'Неверный пароль' } };
      expect(AuthErrorHandler.extractMessage(error)).toBe('Неверный пароль');
    });

    it('извлекает message из data.message', () => {
      const error = { status: 400, data: { message: 'Bad request' } };
      expect(AuthErrorHandler.extractMessage(error)).toBe('Bad request');
    });

    it('извлекает error из data.error (legacy)', () => {
      const error = { status: 422, data: { error: 'Legacy error' } };
      expect(AuthErrorHandler.extractMessage(error)).toBe('Legacy error');
    });

    it('возвращает fallback для пустой ошибки', () => {
      expect(AuthErrorHandler.extractMessage(null)).toBe(
        'Произошла неизвестная ошибка.',
      );
      expect(AuthErrorHandler.extractMessage(undefined)).toBe(
        'Произошла неизвестная ошибка.',
      );
    });

    it('обрабатывает TypeError как network error', () => {
      const error = new TypeError('Failed to fetch');
      expect(AuthErrorHandler.extractMessage(error)).toBe(
        'Ошибка сети. Проверьте подключение к интернету.',
      );
    });

    it('обрабатывает FastAPI validation errors (array)', () => {
      const error = {
        status: 422,
        data: {
          detail: [
            {
              loc: ['body', 'email'],
              msg: 'Invalid email',
              type: 'value_error',
            },
            {
              loc: ['body', 'password'],
              msg: 'Too short',
              type: 'value_error',
            },
          ],
        },
      };
      expect(AuthErrorHandler.extractMessage(error)).toBe(
        'Invalid email; Too short',
      );
    });
  });

  describe('classifyError', () => {
    it('классифицирует 403 с email подтверждением', () => {
      const error = {
        status: 403,
        data: {
          detail:
            'Для авторизации требуется подтверждение почты по ссылке в письме.',
        },
      };
      expect(AuthErrorHandler.classifyError(error)).toBe(
        AuthErrorType.email_not_confirmed,
      );
    });

    it('классифицирует 404 user_not_found', () => {
      const error = {
        status: 404,
        data: { detail: 'Пользователь не найден.' },
      };
      expect(AuthErrorHandler.classifyError(error)).toBe(
        AuthErrorType.user_not_found,
      );
    });

    it('классифицирует 422 invalid_credentials', () => {
      const error = {
        status: 422,
        data: { detail: 'Введен неверный пароль для пользователя.' },
      };
      expect(AuthErrorHandler.classifyError(error)).toBe(
        AuthErrorType.invalid_credentials,
      );
    });

    it('классифицирует 401 как session_expired', () => {
      const error = { status: 401 };
      expect(AuthErrorHandler.classifyError(error)).toBe(
        AuthErrorType.session_expired,
      );
    });

    it('классифицирует 406 как already_active', () => {
      const error = {
        status: 406,
        data: { detail: 'Ваш аккаунт уже активирован.' },
      };
      expect(AuthErrorHandler.classifyError(error)).toBe(
        AuthErrorType.already_active,
      );
    });

    it('классифицирует TypeError как network_error', () => {
      const error = new TypeError('Failed to fetch');
      expect(AuthErrorHandler.classifyError(error)).toBe(
        AuthErrorType.network_error,
      );
    });

    it('классифицирует 400 invalid_status', () => {
      const error = {
        status: 400,
        data: { detail: 'Неправильный статус для авторизации по username.' },
      };
      expect(AuthErrorHandler.classifyError(error)).toBe(
        AuthErrorType.invalid_status,
      );
    });

    it('классифицирует unknown для неизвестной ошибки', () => {
      const error = { status: 418 };
      expect(AuthErrorHandler.classifyError(error)).toBe(AuthErrorType.unknown);
    });
  });

  describe('getRequiredAction', () => {
    it('возвращает email_confirm для 403', () => {
      const error = { status: 403, data: { detail: 'почта не подтверждена' } };
      expect(AuthErrorHandler.getRequiredAction(error)).toBe(
        AuthErrorAction.email_confirm,
      );
    });

    it('возвращает reauth для 401', () => {
      const error = { status: 401 };
      expect(AuthErrorHandler.getRequiredAction(error)).toBe(
        AuthErrorAction.reauth,
      );
    });

    it('возвращает show_message для 422', () => {
      const error = { status: 422, data: { detail: 'Неверный пароль' } };
      expect(AuthErrorHandler.getRequiredAction(error)).toBe(
        AuthErrorAction.show_message,
      );
    });

    it('возвращает server_error для 5xx', () => {
      const error = { status: 500 };
      expect(AuthErrorHandler.getRequiredAction(error)).toBe(
        AuthErrorAction.server_error,
      );
    });

    it('возвращает show_message для network_error', () => {
      const error = new TypeError('Failed to fetch');
      expect(AuthErrorHandler.getRequiredAction(error)).toBe(
        AuthErrorAction.show_message,
      );
    });
  });

  describe('buildAuthError', () => {
    it('строит AuthError из RTK Query error с status', () => {
      const error = {
        status: 403,
        data: {
          detail:
            'Для авторизации требуется подтверждение почты по ссылке в письме.',
        },
      };
      const authError = AuthErrorHandler.buildAuthError(error);

      expect(authError.type).toBe(AuthErrorType.email_not_confirmed);
      expect(authError.action).toBe(AuthErrorAction.email_confirm);
      expect(authError.httpStatus).toBe(403);
      expect(authError.message.length).toBeGreaterThan(0);
    });

    it('строит AuthError из TypeError (network)', () => {
      const error = new TypeError('Failed to fetch');
      const authError = AuthErrorHandler.buildAuthError(error);

      expect(authError.type).toBe(AuthErrorType.network_error);
      expect(authError.message).toBe(
        'Ошибка сети. Проверьте подключение к интернету.',
      );
    });

    it('строит AuthError из 422 invalid password', () => {
      const error = {
        status: 422,
        data: { detail: 'Введен неверный пароль для пользователя.' },
      };
      const authError = AuthErrorHandler.buildAuthError(error);

      expect(authError.type).toBe(AuthErrorType.invalid_credentials);
      expect(authError.action).toBe(AuthErrorAction.show_message);
      expect(authError.httpStatus).toBe(422);
    });

    it('строит AuthError из 404 user_not_found', () => {
      const error = {
        status: 404,
        data: { detail: 'Пользователь не найден.' },
      };
      const authError = AuthErrorHandler.buildAuthError(error);

      expect(authError.type).toBe(AuthErrorType.user_not_found);
      expect(authError.httpStatus).toBe(404);
    });

    it('возвращает fallback для null', () => {
      const authError = AuthErrorHandler.buildAuthError(null);
      expect(authError.type).toBe(AuthErrorType.unknown);
      expect(authError.message).toBe('Произошла неизвестная ошибка.');
    });

    it('сохраняет AuthError как есть если уже является им', () => {
      const existingAuthError = {
        type: AuthErrorType.email_not_confirmed,
        action: AuthErrorAction.email_confirm,
        message: 'Custom message',
        httpStatus: 403,
        originalError: null,
      };
      const result = AuthErrorHandler.buildAuthError(existingAuthError);
      expect(result).toBe(existingAuthError);
    });
  });

  describe('shouldShowGlobalToast', () => {
    it('возвращает true для 401 (session_expired)', () => {
      expect(AuthErrorHandler.shouldShowGlobalToast({ status: 401 })).toBe(
        true,
      );
    });

    it('возвращает true для 5xx (server_error)', () => {
      expect(AuthErrorHandler.shouldShowGlobalToast({ status: 500 })).toBe(
        true,
      );
    });

    it('возвращает false для 403 (email_not_confirmed)', () => {
      expect(
        AuthErrorHandler.shouldShowGlobalToast({
          status: 403,
          data: { detail: 'почта' },
        }),
      ).toBe(false);
    });

    it('возвращает false для 422 (invalid_credentials)', () => {
      expect(
        AuthErrorHandler.shouldShowGlobalToast({
          status: 422,
          data: { detail: 'пароль' },
        }),
      ).toBe(false);
    });
  });

  describe('isEmailNotConfirmedError', () => {
    it('возвращает true для 403 с email подтверждением', () => {
      const error = {
        status: 403,
        data: { detail: 'подтверждение почты' },
      };
      expect(AuthErrorHandler.isEmailNotConfirmedError(error)).toBe(true);
    });

    it('возвращает false для 422 invalid password', () => {
      const error = {
        status: 422,
        data: { detail: 'Неверный пароль' },
      };
      expect(AuthErrorHandler.isEmailNotConfirmedError(error)).toBe(false);
    });

    it('возвращает false для 404', () => {
      const error = { status: 404, data: { detail: 'Пользователь не найден' } };
      expect(AuthErrorHandler.isEmailNotConfirmedError(error)).toBe(false);
    });
  });
});
