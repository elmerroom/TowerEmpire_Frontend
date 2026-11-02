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
import { useRecoveryPasswordMutation } from '../../../../store/api/authApi';
import { AuthErrorHandler } from '../../model/errors/auth-error-handler';
import { clearError } from '../../../../store/slices/authErrorSlice';
import {
  setNewPasswordSchema,
  SetNewPasswordFormValues,
} from '../model/password-reset-schema';
import { Button } from '../../../../shared/ui/Button';

interface SetNewPasswordFormProps {
  email: string;
  onSuccess: (message: string) => void;
}

export const SetNewPasswordForm: React.FC<SetNewPasswordFormProps> = ({
  email,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [recoverPassword, { isLoading: isSubmitting }] =
    useRecoveryPasswordMutation();

  const [isShown, setShown] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SetNewPasswordFormValues) => {
    try {
      setServerError('');
      const result = await recoverPassword({
        email,
        code: data.code,
        new_password: data.password,
      }).unwrap();

      const successMessage =
        (result as any)?.ACCESS || 'Пароль успешно обновлён';
      dispatch(clearError());
      onSuccess(successMessage);
    } catch (error) {
      const authError = AuthErrorHandler.buildAuthError(error);
      setServerError(authError.message);
    }
  };

  return (
    <div className="form_input">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="inputCode" className="form-label text-color-blue">
            Код подтверждения:
          </label>
          <input
            {...register('code')}
            type="number"
            id="inputCode"
            autoComplete="off"
            className={`form-control input__number-input ${errors.code ? 'form-control_error' : ''}`}
          />
          <div className="error-input">{errors.code?.message}</div>
        </div>

        <div className="mb-3 reg">
          <label
            htmlFor="inputNewPassword"
            className="form-label text-color-blue"
          >
            Новый пароль:
            <div className="reg_helper">
              <FontAwesomeIcon icon={faCircleInfo} />
              <div className="reg_helper-modal">
                <ul>
                  <li>От 8 до 15 символов;</li>
                  <li>
                    Используйте буквы верхнего и нижнего регистра и специальные
                    символы;
                  </li>
                  <li>Минимум одну цифру;</li>
                  <li>Без пробелов.</li>
                </ul>
              </div>
            </div>
          </label>
          <input
            {...register('password')}
            type={isShown ? 'text' : 'password'}
            id="inputNewPassword"
            maxLength={15}
            autoComplete="new-password"
            className={`form-control input-nickname ${errors.password ? 'form-control_error' : ''}`}
          />
          <FontAwesomeIcon
            onClick={() => setShown(prev => !prev)}
            className="reg_helper-eye"
            icon={isShown ? faEye : faEyeSlash}
          />
          <div className="error-input">{errors.password?.message}</div>
        </div>

        <div className="mb-3">
          <label
            htmlFor="inputSetRepeatedPassword"
            className="form-label text-color-blue"
          >
            Повторите пароль:
          </label>
          <input
            {...register('confirmPassword')}
            type={isShown ? 'text' : 'password'}
            id="inputSetRepeatedPassword"
            maxLength={15}
            autoComplete="new-password"
            className={`form-control input-nickname ${errors.confirmPassword ? 'form-control_error' : ''}`}
          />
          <div className="error-input">{errors.confirmPassword?.message}</div>
        </div>

        <div className={`error ${serverError ? 'visible' : 'hidden'}`}>
          {serverError}
        </div>

        <div className="d-flex justify-content-center">
          <Button
            id="set-new-password-button"
            variant="submit"
            type="submit"
            className="d-flex justify-content-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохраняем...' : 'Отправить'}
          </Button>
        </div>
      </form>
    </div>
  );
};
