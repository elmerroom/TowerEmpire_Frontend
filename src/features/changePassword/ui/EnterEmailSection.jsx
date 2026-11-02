import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { useSendCodeToEmailMutation } from '../../../store/api/authApi';
import { Button } from '../../../shared/ui/Button';
import { sendResetPasswordSchema } from '@/features/auth/password-reset/model/password-reset-schema';

export const EnterEmailSection = ({ onNextStep, onBack }) => {
  const [infoText, setInfoText] = useState(
    'Укажите почту, на которую вы хотите получить ссылку для сброса пароля',
  );
  const [serverError, setServerError] = useState('');
  const [sendCodeToEmail, { isLoading }] = useSendCodeToEmailMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(sendResetPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async data => {
    try {
      setServerError('');
      setInfoText(
        'Отправляем письмо с инструкциями по восстановлению пароля...',
      );
      await sendCodeToEmail({
        email: data.email,
        action: 'reset_password',
      }).unwrap();
      onNextStep(data.email);
    } catch (err) {
      const message =
        err?.data?.detail ??
        err?.data?.message ??
        err?.data?.error ??
        err?.message ??
        'Не удалось отправить письмо';
      setServerError(message);
      setInfoText(
        'Укажите почту, на которую вы хотите получить ссылку для сброса пароля',
      );
    }
  };

  return (
    <div className="reset-password-section d-flex flex-column align-items-center text-center">
      <div className="d-flex justify-content-center align-items-center">
        <h1 className="my-modal-title title-white">Восстановление пароля</h1>
      </div>
      <ModalSVG />
      <p className="mb-3">{infoText}</p>
      <form className="form_input" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3 reg">
          <label
            htmlFor="changePasswordEmail"
            className="form-label text-color-blue"
          >
            Email:
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
            id="changePasswordEmail"
            maxLength={254}
            autoComplete="email"
            className={`form-control ${errors.email ? 'form-control_error' : ''}`}
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
            variant="submit"
            type="submit"
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Отправляем...' : 'Отправить'}
          </Button>
        </div>
      </form>
    </div>
  );
};
