import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useSendCodeToEmailMutation } from '../../../../store/api/authApi';
import { AuthErrorHandler } from '../../model/errors/auth-error-handler';
import {
  sendResetPasswordSchema,
  SendResetPasswordFormValues,
} from '../model/password-reset-schema';
import { Button } from '../../../../shared/ui/Button';

interface SendResetPasswordFormProps {
  onSuccess: (email: string) => void;
}

export const SendResetPasswordForm: React.FC<SendResetPasswordFormProps> = ({
  onSuccess,
}) => {
  const [sendCodeToEmail, { isLoading }] = useSendCodeToEmailMutation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SendResetPasswordFormValues>({
    resolver: zodResolver(sendResetPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SendResetPasswordFormValues) => {
    try {
      setServerError('');
      await sendCodeToEmail({
        email: data.email,
      }).unwrap();
      onSuccess(data.email);
    } catch (error) {
      const authError = AuthErrorHandler.buildAuthError(error);
      setServerError(authError.message);
    }
  };

  return (
    <div className="form_input">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3 reg">
          <label htmlFor="forgotemail" className="form-label text-color-blue">
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
            type="text"
            id="forgotemail"
            maxLength={30}
            className={`form-control input-nickname ${errors.email ? 'form-control_error' : ''}`}
            autoComplete="email"
          />
          <div
            className="error-input"
            style={{ minHeight: '28px', alignSelf: 'stretch' }}
          >
            {errors.email?.message}
          </div>
        </div>

        <div className={`error ${serverError ? 'visible' : 'hidden'}`}>
          {serverError}
        </div>

        <div className="d-flex justify-content-center">
          <Button
            id="reset-password-button"
            variant="submit"
            type="submit"
            className="d-flex justify-content-center"
            disabled={isLoading}
          >
            {isLoading ? 'Отправляем...' : 'Отправить'}
          </Button>
        </div>
      </form>
    </div>
  );
};
