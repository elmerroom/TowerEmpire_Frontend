import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { closeModal, selectModalData } from '../../../store/modalSlice';
import { Button } from '../../../shared/ui/Button';
import { useResendConfirmationEmailMutation } from '../../../store/api/authApi';
import { russianEmailSchema } from '@/shared/lib/validation';

const COOLDOWN_SECONDS = 60;

const validateEmail = value => {
  const result = russianEmailSchema.safeParse(value);
  return result.success ? '' : (result.error.issues[0]?.message ?? '');
};

const validatePassword = value =>
  !value
    ? 'Пароль обязателен'
    : value.length < 8
      ? 'Минимум 8 символов'
      : value.length > 15
        ? 'Максимум 15 символов'
        : '';

// Статусы, которые возвращает POST /api/users/resend_confirmation_email/
const RESEND_ERRORS = {
  400: 'Проверьте, что почта и пароль заполнены верно.',
  404: 'Пользователь с такой почтой не найден.',
  406: 'Этот аккаунт уже подтверждён — можно просто войти.',
  422: 'Неверный пароль.',
};

const RESEND_ERROR_FALLBACK = 'Не удалось отправить письмо. Попробуйте позже.';

export const ModalConfirmCodeAuth = ({ email = '' }) => {
  const dispatch = useDispatch();
  const isOpen = useSelector(state => !!state.modal.openModals['confirmEmail']);
  const modalData = useSelector(state =>
    selectModalData(state, 'confirmEmail'),
  );
  const effectiveEmail = modalData?.email || email;

  const autoShowResendForm = Boolean(modalData?.autoShowResendForm);

  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isShown, setShown] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const [resend, { isLoading }] = useResendConfirmationEmailMutation();

  const emailError = validateEmail(resendEmail);
  const passwordError = validatePassword(password);
  const isValid = !emailError && !passwordError;

  useEffect(() => {
    if (isOpen) {
      setResendEmail(effectiveEmail);
      setShowResendForm(autoShowResendForm);
      setSuccessMsg('');
      setErrorMsg('');
      setPassword('');
      setCooldown(0);
      setShown(false);
      setTouched({ email: false, password: false });
    }
  }, [isOpen, effectiveEmail, autoShowResendForm]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleClose = () => {
    dispatch(closeModal('confirmEmail'));
  };

  const handleResendSubmit = async e => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await resend({ email: resendEmail, password }).unwrap();
      setSuccessMsg('Письмо отправлено повторно!');
      setPassword('');
      setShowResendForm(false);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setErrorMsg(RESEND_ERRORS[err?.status] ?? RESEND_ERROR_FALLBACK);
    }
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      portalTarget="body"
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className=""></div>
        <h1 className="my-modal-title title-white">
          {showResendForm ? 'подтверждение почты' : 'подтверждение регистрации'}
        </h1>
      </div>
      <div className="modal_svg">
        <ModalSVG />
      </div>
      <div
        className="modal-content_confirm"
        style={{ maxWidth: '500px', textAlign: 'center' }}
      >
        {showResendForm
          ? 'Введите данные, указанные при регистрации, для отправки ссылки'
          : 'На указанную почту было отправлено письмо для подтверждения регистрации'}
      </div>

      {successMsg && (
        <div
          className="d-flex justify-content-center mt-2"
          style={{ color: '#4caf50', fontSize: '14px' }}
        >
          {successMsg}
        </div>
      )}

      {!showResendForm && (
        <div className="d-flex justify-content-center mt-2">
          <Button
            variant="submit"
            className="d-flex justify-content-center"
            disabled={cooldown > 0}
            onClick={() => setShowResendForm(true)}
            style={cooldown > 0 ? { opacity: 0.5 } : undefined}
          >
            {cooldown > 0
              ? `Отправить повторно через ${cooldown}с`
              : 'Отправить повторно'}
          </Button>
        </div>
      )}

      {showResendForm && (
        <form onSubmit={handleResendSubmit} className="mt-3" noValidate>
          <div className="mb-2">
            <label
              htmlFor="inputResendEmail"
              className="form-label text-color-blue"
              style={{ fontSize: '13px', marginBottom: '2px' }}
            >
              E-mail:
            </label>
            <input
              type="email"
              id="inputResendEmail"
              maxLength={254}
              autoComplete="email"
              className={`form-control ${touched.email && emailError ? 'form-control_error' : ''}`}
              value={resendEmail}
              onChange={e => setResendEmail(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            />
            <div
              className="error-input"
              style={{ fontSize: '11px', minHeight: '14px', marginTop: 0 }}
            >
              {touched.email ? emailError : ''}
            </div>
          </div>
          <div className="mb-2">
            <label
              htmlFor="inputResendPassword"
              className="form-label text-color-blue"
              style={{ fontSize: '13px', marginBottom: '2px' }}
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
                type={isShown ? 'text' : 'password'}
                id="inputResendPassword"
                maxLength={15}
                autoComplete="current-password"
                className={`form-control ${touched.password && passwordError ? 'form-control_error' : ''}`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
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
              {touched.password ? passwordError : ''}
            </div>
          </div>
          {errorMsg && (
            <div
              style={{
                color: '#e57373',
                fontSize: '13px',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              {errorMsg}
            </div>
          )}
          <div className="d-flex justify-content-center gap-2">
            <Button
              variant="submit"
              type="submit"
              disabled={!isValid || isLoading}
              className="d-flex justify-content-center"
            >
              {isLoading ? 'Отправка...' : 'Отправить ссылку'}
            </Button>
          </div>
        </form>
      )}

      {!showResendForm && (
        <div className="d-flex justify-content-center mt-3">
          <Button
            id="confirm-email-button"
            variant="submit"
            className="d-flex justify-content-center"
            onClick={handleClose}
          >
            Ок
          </Button>
        </div>
      )}
    </UniversalModal>
  );
};
