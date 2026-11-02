import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import { useRegistrationMutation } from '../../../../store/api/authApi';
import { AuthErrorHandler } from '../../model/errors/auth-error-handler';
import { clearError } from '../../../../store/slices/authErrorSlice';
import { registerSchema, RegisterFormValues } from '../model/register-schema';
import { Button } from '../../../../shared/ui/Button';

interface RegisterFormProps {
  onSuccess: (email: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const [registration, { isLoading }] = useRegistrationMutation();

  const [isShown, setShown] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerError('');
      await registration({
        username: data.username,
        email: data.email,
        password: data.password,
        password_2: data.repeatPassword,
      }).unwrap();

      dispatch(clearError());
      onSuccess(data.email);
    } catch (error) {
      const authError = AuthErrorHandler.buildAuthError(error);
      setServerError(authError.message);
    }
  };

  return (
    <div className="form_input">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-1 reg">
          <label
            htmlFor="inputNicknameAuth"
            className="form-label text-color-blue"
            style={{ marginBottom: '2px' }}
          >
            Никнейм:
            <div className="reg_helper">
              <FontAwesomeIcon icon={faCircleInfo} />
              <div className="reg_helper-modal">
                <ul>
                  <li>Кириллица или латиница.</li>
                  <li>
                    Допустимы символы, цифры и пробелы, но не более 15-ти, не
                    может состоять только из пробелов.
                  </li>
                </ul>
              </div>
            </div>
          </label>
          <input
            {...register('username')}
            type="text"
            maxLength={15}
            id="inputNicknameAuth"
            autoComplete="name"
            className={`form-control ${errors.username ? 'form-control_error' : ''}`}
          />
          <div
            className="error-input"
            style={{ fontSize: '11px', minHeight: '14px', marginTop: 0 }}
          >
            {errors.username?.message}
          </div>
        </div>

        <div className="mb-1 reg">
          <label
            htmlFor="inputemail"
            className="form-label text-color-blue"
            style={{ marginBottom: '2px' }}
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
            maxLength={254}
            id="inputemail"
            autoComplete="off"
            className={`form-control ${errors.email ? 'form-control_error' : ''}`}
          />
          <div
            className="error-input"
            style={{
              fontSize: '11px',
              minHeight: '28px',
              marginTop: 0,
              alignSelf: 'stretch',
            }}
          >
            {errors.email?.message}
          </div>
        </div>

        <div className="mb-1">
          <label
            htmlFor="inputPassword"
            className="form-label text-color-blue"
            style={{ marginBottom: '2px' }}
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
          <div className="reg">
            <input
              {...register('password')}
              type={isShown ? 'text' : 'password'}
              maxLength={15}
              id="inputPassword"
              autoComplete="off"
              className={`form-control ${errors.password ? 'form-control_error' : ''}`}
            />
            <FontAwesomeIcon
              onClick={() => setShown(prev => !prev)}
              className="reg_helper-eye"
              icon={isShown ? faEye : faEyeSlash}
              style={{ top: '50%', cursor: 'pointer' }}
            />
          </div>
          <div
            className="error-input"
            style={{ fontSize: '11px', minHeight: '14px', marginTop: 0 }}
          >
            {errors.password?.message}
          </div>
        </div>

        <div className="mb-1">
          <label
            htmlFor="inputRepeatedPassword"
            className="form-label text-color-blue"
            style={{ marginBottom: '2px' }}
          >
            Повторите пароль:
          </label>
          <input
            {...register('repeatPassword')}
            type={isShown ? 'text' : 'password'}
            maxLength={15}
            id="inputRepeatedPassword"
            autoComplete="repeated-password"
            className={`form-control ${errors.repeatPassword ? 'form-control_error' : ''}`}
          />
          <div
            className="error-input"
            style={{ fontSize: '11px', minHeight: '14px', marginTop: 0 }}
          >
            {errors.repeatPassword?.message}
          </div>
        </div>

        <div className="mb-1 d-flex align-items-center gap-2">
          <input
            {...register('agreeToTerms')}
            type="checkbox"
            id="agreeToTerms"
            className={`form-check-input flex-shrink-0 ${errors.agreeToTerms ? 'is-invalid' : ''}`}
            style={{
              cursor: 'pointer',
              margin: 0,
              width: '1.5em',
              height: '1.5em',
            }}
          />
          <div className="flex-grow-1">
            <label
              htmlFor="agreeToTerms"
              className="form-check-label text-color-blue"
              style={{
                fontSize: '10px',
                cursor: 'pointer',
                display: 'block',
                lineHeight: '1.2',
              }}
            >
              Соглашаюсь на обработку&nbsp;
              <Link
                to="/personal-data-policy"
                className="text-decoration-underline fs-6"
                onClick={e => e.stopPropagation()}
              >
                персональных данных
              </Link>{' '}
              в соответствии с&nbsp;
              <Link
                to="/privacy-policy"
                className="text-decoration-underline fs-6"
                onClick={e => e.stopPropagation()}
              >
                политикой конфиденциальности
              </Link>
            </label>
            <div
              className="error-input"
              style={{ fontSize: '12px', minHeight: '12px', marginTop: 0 }}
            >
              {errors.agreeToTerms?.message}
            </div>
          </div>
        </div>

        <div className={`error ${serverError ? 'visible' : 'hidden'}`}>
          {serverError}
        </div>

        <div className="d-flex justify-content-center">
          <Button
            id="auth-button"
            variant="submit"
            type="submit"
            className="d-flex justify-content-center"
            disabled={!isValid || isLoading}
          >
            Подтвердить
          </Button>
        </div>
      </form>
    </div>
  );
};
