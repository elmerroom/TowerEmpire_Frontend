import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { validatePassword } from '../../../components/helpers/help_functions';
import { Input } from '../../../shared/input';
import { useRecoveryPasswordMutation } from '../../../store/api/authApi';
import { Button } from '../../../shared/ui/Button';

export const ResetPasswordSection = ({ email, onNextStep, onBack }) => {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isDisabled, setDisabled] = useState(false);
  const [recoveryPassword, { isLoading }] = useRecoveryPasswordMutation();

  useEffect(() => {
    if (!password) {
      setPasswordError('Пароль не может быть пустым');
    }
    if (password && !validatePassword(password)) {
      setPasswordError('Пароль не соответствует требованиям безопасности');
    } else if (password && validatePassword(password)) {
      setPasswordError('');
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmError('Пароли не совпадают');
    } else {
      setConfirmError('');
    }
  }, [confirmPassword, password]);

  const handleSubmit = async () => {
    let hasErrors = false;
    if (!code.trim()) {
      setCodeError('Введите код подтверждения');
      hasErrors = true;
    }

    if (!validatePassword(password)) {
      setPasswordError('Пароль не соответствует требованиям безопасности');
      hasErrors = true;
    }

    if (password !== confirmPassword) {
      setConfirmError('Пароли не совпадают');
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      setDisabled(true);
      const response = await recoveryPassword({
        email,
        code,
        new_password: password,
      }).unwrap();

      const successMessage =
        (response &&
          typeof response === 'object' &&
          'ACCESS' in response &&
          response.ACCESS) ||
        'Пароль успешно обновлён';

      onNextStep({ type: 'success', message: successMessage });
      setPassword('');
      setCode('');
      setConfirmPassword('');
      setCodeError('');
      setPasswordError('');
      setConfirmError('');
    } catch (err) {
      const message =
        err?.data?.detail ??
        err?.data?.message ??
        err?.data?.error ??
        err?.message ??
        'Не удалось обновить пароль';
      setPasswordError(message);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <div className="reset-password-section">
      <div className="d-flex justify-content-center align-items-center">
        <h1 className="my-modal-title title-white">смена пароля</h1>
      </div>

      <div className="modal_svg">
        <ModalSVG />
      </div>

      <form className="form_input" onSubmit={e => e.preventDefault()}>
        <Input
          type="number"
          label="Код подтверждения:"
          maxLength={15}
          id="inputCode"
          autoComplete="off"
          value={code}
          onChange={e => {
            setCode(e.target.value);
            setCodeError('');
          }}
          error={codeError}
        />

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
          <Input
            type="password"
            maxLength={15}
            id="inputNewPassword"
            autoComplete="current-password"
            value={password}
            error={passwordError}
            onChange={e => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
          />
        </div>

        <Input
          type="password"
          label="Повторите пароль:"
          maxLength={15}
          id="inputSetRepeatedPassword"
          autoComplete="new-password"
          value={confirmPassword}
          error={confirmError}
          onChange={e => {
            setConfirmError('');
            setConfirmPassword(e.target.value);
          }}
        />
      </form>

      <div className="d-flex justify-content-center">
        <Button
          id="set-new-password-button"
          variant="submit"
          onClick={handleSubmit}
          disabled={isDisabled || isLoading}
        >
          {isDisabled || isLoading ? 'Сохраняем...' : 'Отправить'}
        </Button>
      </div>
    </div>
  );
};
