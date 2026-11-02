import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '@/entities/user/model/hooks';
import { useUpdateProfileMutation } from '@/entities/user/api/user-api';
import { ModalSVG } from '@/shared/svg/modal_svg';
import { BtnIcon } from '@/shared/ui/BtnIcon';
import { UniversalModal } from '@/shared/universal-modal/UniversalModal';
import { closeModal } from '@/store/modalSlice';
import {
  EnterEmailSection,
  ResetPasswordSection,
  SuccessfullySection,
} from '@/features/changePassword';
import { DeleteAccountSection } from '@/features/delete-account';
import { profileSchema, ProfileFormValues } from '../../model/profile-schema';
import { Button } from '@/shared/ui/Button';

type Section =
  | 'main'
  | 'enterEmailSection'
  | 'resetPasswordSection'
  | 'successfullySection'
  | 'deleteAccountSection';

export const ProfileSettingsModal = () => {
  const dispatch = useDispatch();
  const { username, email, nickname_color, is_vip } = useUser();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [activeSection, setActiveSection] = useState<Section>('main');
  const [resetEmail, setResetEmail] = useState('');
  const [response, setResponse] = useState<{
    type?: string;
    message?: string;
  }>({});

  const [serverError, setServerError] = useState<string | null>(null);

  const isOpen = useSelector(
    (state: any) => !!state.modal.openModals['modalProfileSettings'],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      username: username || '',
      email: email || '',
      nickname_color: nickname_color || '#FFFFFF',
    },
  });

  const watchedNicknameColor = watch('nickname_color');

  // Sync with user data when it changes (e.g. after initial load)
  useEffect(() => {
    if (isOpen) {
      reset({
        username: username || '',
        email: email || '',
        nickname_color: nickname_color || '#FFFFFF',
      });
      setServerError(null);
    }
  }, [isOpen, username, email, nickname_color, reset]);

  const handleClose = () => {
    setActiveSection('main');
    dispatch(closeModal('modalProfileSettings'));
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setServerError(null);
      const updateData: Partial<ProfileFormValues> = {};

      if (data.username !== username) updateData.username = data.username;
      if (data.email !== email)
        updateData.email = data.email === '' ? null : data.email;
      if (data.nickname_color !== nickname_color)
        updateData.nickname_color = data.nickname_color;

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData).unwrap();
      }
      handleClose();
    } catch (err: any) {
      setServerError(err.message || 'Ошибка обновления профиля');
    }
  };

  const nickColors = is_vip
    ? [
        '#FFFFFF',
        '#00FFFD',
        '#FF3002',
        '#11A511',
        '#000000',
        '#7F7F7F',
        '#9E0000',
        '#CDFF31',
        '#FF6BFF',
        '#FFD030',
        '#0065D0',
        '#FFCFFF',
        '#FFFF66',
        '#FE3062',
        '#65CEFF',
        '#64FF64',
        '#C68500',
      ]
    : ['#FFFFFF', '#00FFFF', '#F24A4A', '#5BFF5B', '#000000'];

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="body"
      className="modal-profile-settings"
    >
      {activeSection === 'main' && (
        <>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="my-modal-title title-white mx-auto">
              данные пользователя
            </h1>
          </div>
          <ModalSVG />
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="d-flex flex-column align-items-start gap-3 w-75"
          >
            <div className="w-100">
              <label className="text-color-blue">Никнейм:</label>
              <input
                type="text"
                {...register('username')}
                className={`form-control ${errors.username ? 'form-control_error' : ''}`}
                autoComplete="username"
              />
              {errors.username && (
                <div className="error-input">{errors.username.message}</div>
              )}
            </div>

            <div className="w-100 reg">
              <label className="text-color-blue">
                E-mail:
                <div className="reg_helper">
                  <FontAwesomeIcon icon={faCircleInfo} />
                  <div className="reg_helper-modal">
                    <ul>
                      <li>Любой домен в зоне .ru или .рф;</li>
                      <li>
                        А также vk.com, yandex.com, yandex.by, yandex.kz,
                        yandex.uz.
                      </li>
                    </ul>
                  </div>
                </div>
              </label>
              <input
                type="email"
                {...register('email')}
                className={`form-control ${errors.email ? 'form-control_error' : ''}`}
                autoComplete="email"
              />
              <div className="error-input" style={{ minHeight: '28px' }}>
                {errors.email?.message}
              </div>
            </div>

            <div className="w-100">
              <label className="text-color-blue">Выбор цвета ника:</label>
              <div
                className={`colors d-flex flex-row justify-content-${is_vip ? 'center' : 'start'} flex-wrap gap-1`}
              >
                {nickColors.map((color, index) => (
                  <div
                    className={
                      color === watchedNicknameColor ? 'item-border' : ''
                    }
                    key={index}
                  >
                    <div
                      className="color_item"
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setValue('nickname_color', color, { shouldDirty: true })
                      }
                    ></div>
                  </div>
                ))}
              </div>
              {errors.nickname_color && (
                <div className="error-input">
                  {errors.nickname_color.message}
                </div>
              )}
            </div>

            <div
              className="text-color-blue"
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveSection('enterEmailSection')}
            >
              Сменить пароль
            </div>
            <div
              className="text-color-blue"
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveSection('deleteAccountSection')}
            >
              Удалить аккаунт
            </div>

            <Button
              variant="submit"
              type="submit"
              className="align-self-center me-3"
              disabled={!isDirty || !isValid || isLoading}
            >
              {isLoading ? (
                'Сохранение...'
              ) : (
                <>
                  Сохранить <BtnIcon src="/img/YES.svg" />
                </>
              )}
            </Button>
            {serverError && (
              <div className="error text-danger mt-2">{serverError}</div>
            )}
          </form>
        </>
      )}

      {activeSection === 'enterEmailSection' && (
        <EnterEmailSection
          onNextStep={(emailFromReset: string) => {
            setResetEmail(emailFromReset);
            setActiveSection('resetPasswordSection');
          }}
          onBack={() => setActiveSection('main')}
        />
      )}
      {activeSection === 'resetPasswordSection' && (
        <ResetPasswordSection
          email={resetEmail}
          onBack={() => setActiveSection('enterEmailSection')}
          onNextStep={(resp: { type?: string; message?: string }) => {
            setResponse(resp);
            setActiveSection('successfullySection');
          }}
        />
      )}
      {activeSection === 'successfullySection' && (
        <SuccessfullySection
          response={response}
          onSuccess={() => setActiveSection('main')}
        />
      )}
      {activeSection === 'deleteAccountSection' && (
        <DeleteAccountSection onBack={() => setActiveSection('main')} />
      )}
    </UniversalModal>
  );
};
