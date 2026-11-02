import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useAuthFlow } from '../../model/use-auth-flow';
import { AuthErrorHandler } from '../../model/errors/auth-error-handler';
import { clearError } from '../../../../store/slices/authErrorSlice';
import {
  guestLoginSchema,
  GuestLoginFormValues,
} from '../model/guest-login-schema';
import { generateRandomUsername } from '../../../../components/helpers/help_functions';
import { Button } from '../../../../shared/ui/Button';

interface GuestLoginFormProps {
  onSuccess: () => void;
}

export const GuestLoginForm: React.FC<GuestLoginFormProps> = ({
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const { signIn } = useAuthFlow();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestLoginFormValues>({
    resolver: zodResolver(guestLoginSchema),
    defaultValues: {
      username: generateRandomUsername(),
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: GuestLoginFormValues) => {
    try {
      setServerError('');
      await signIn({ username: data.username });
      dispatch(clearError());
      onSuccess();
    } catch (error) {
      const authError = AuthErrorHandler.buildAuthError(error);
      setServerError(authError.message);
    }
  };

  return (
    <div className="form_input">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="inputNickname" className="form-label text-color-blue">
            Никнейм:
          </label>
          <div className="reg_helper">
            <FontAwesomeIcon icon={faCircleInfo} />
            <div className="reg_helper-modal">
              <ul>
                <li>Кириллица или латиница.</li>
                <li>
                  Допустимы символы, цифры и пробелы, но не может состоять
                  только из пробелов.
                </li>
              </ul>
            </div>
          </div>
          <input
            {...register('username')}
            type="text"
            id="inputNickname"
            maxLength={15}
            className={`form-control ${errors.username ? 'form-control_error' : ''}`}
            aria-describedby="username"
          />
          <div className="error-input">{errors.username?.message}</div>
        </div>

        <div className={`error ${serverError ? 'visible' : 'hidden'}`}>
          {serverError}
        </div>

        <div className="d-flex justify-content-center">
          <Button
            id="play-noauth-button"
            variant="submit"
            type="submit"
            className="d-flex justify-content-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Подтверждаем...' : 'Подтвердить'}
          </Button>
        </div>
      </form>
    </div>
  );
};
