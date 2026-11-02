import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthFlow } from '../../model/use-auth-flow';
import { AuthErrorHandler } from '@/features/auth/model/errors/auth-error-handler';
import { AuthError, AuthErrorAction } from '@/features/auth/model/errors/types';
import { clearError } from '@/store/slices/authErrorSlice';
import { loginSchema, LoginFormValues } from '../model/login-schema';
import { Button } from '@/shared/ui/Button';

interface LoginFormProps {
  onSuccess: () => void;
  onForgetPassword: () => void;
  onNotConfirmed: (email: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgetPassword,
  onNotConfirmed,
}) => {
  const dispatch = useDispatch();
  const { signIn } = useAuthFlow();

  const [isShown, setShown] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setAuthError(null);
      const auth = await signIn({
        email: data.email,
        password: data.password,
      });
      if (auth) {
        dispatch(clearError());
        onSuccess();
      }
    } catch (error) {
      const nextError = AuthErrorHandler.buildAuthError(error);
      setAuthError(nextError);
      // Сообщение про неподтверждённый email — с активной ссылкой, не прячем по таймеру
      if (nextError.action !== AuthErrorAction.email_confirm) {
        setTimeout(() => setAuthError(null), 7000);
      }
    }
  };

  const handleConfirmClick = () => {
    setAuthError(null);
    onNotConfirmed(getValues('email'));
  };

  return (
    <div className="form_input">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3 reg">
          <label
            htmlFor="inputLoginEmail"
            className="form-label text-color-blue"
          >
            E-mail:
            <div className="reg_helper">
              <FontAwesomeIcon icon={faCircleInfo} />
              <div className="reg_helper-modal">
                <ul>
                  <li>Любой домен в зоне .ru или .рф;</li>
                  <li>
                    А также vk.com, yandex.com, yandex.by, yandex.kz, yandex.uz.
                  </li>
                </ul>
              </div>
            </div>
          </label>
          <input
            {...register('email')}
            type="email"
            id="inputLoginEmail"
            autoComplete="email"
            className={`form-control input-nickname ${errors.email ? 'form-control_error' : ''}`}
          />
          <div
            className="error-input"
            style={{ minHeight: '28px', alignSelf: 'stretch' }}
          >
            {errors.email?.message}
          </div>
        </div>

        <div className="mb-3 reg">
          <label
            htmlFor="inputLoginPassword"
            className="form-label text-color-blue"
          >
            Пароль:
            <div className="reg_helper">
              <FontAwesomeIcon icon={faCircleInfo} />
              <div className="reg_helper-modal">
                <ul>
                  <li>Не менее 8 и не более 15 символов;</li>
                  <li>
                    Как минимум по одной заглавной и одной строчной букве и
                    цифре;
                  </li>
                  <li>Только латинские буквы и арабские цифры;</li>
                  <li>Без пробелов.</li>
                </ul>
              </div>
            </div>
          </label>
          <input
            {...register('password')}
            type={isShown ? 'text' : 'password'}
            maxLength={15}
            id="inputLoginPassword"
            autoComplete="current-password"
            className={`form-control input-nickname ${errors.password ? 'form-control_error' : ''}`}
          />
          <FontAwesomeIcon
            onClick={() => setShown(prev => !prev)}
            className="reg_helper-eye"
            icon={isShown ? faEye : faEyeSlash}
          />
          <div className="error-input">{errors.password?.message}</div>
        </div>

        <div className={`error ${authError ? 'visible' : 'hidden'}`}>
          {authError?.action === AuthErrorAction.email_confirm ? (
            <>
              Ваш аккаунт не подтверждён,{' '}
              <span
                onClick={handleConfirmClick}
                style={{
                  display: 'block',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                нажмите сюда для подтверждения
              </span>
            </>
          ) : (
            authError?.message
          )}
        </div>

        <div className="d-flex justify-content-center flex-column">
          <div
            className="modal_link"
            style={{ marginTop: '10px' }}
            onClick={onForgetPassword}
          >
            <span>Забыли пароль?</span>
          </div>
          <Button
            id="login-button"
            variant="submit"
            type="submit"
            className="d-flex justify-content-center"
            disabled={!isValid || isSubmitting}
          >
            Войти
          </Button>
        </div>
      </form>
    </div>
  );
};
