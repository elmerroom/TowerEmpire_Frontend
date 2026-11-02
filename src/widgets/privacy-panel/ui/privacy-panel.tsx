import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import stylesAnim from './privacy-panel.module.scss';
import { Button } from '@/shared/ui/Button';

export type PrivacyPanelProps = {
  visible: boolean;
  password: string;
  disabled?: boolean;
  isPasswordValid: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  classes?: {
    submitButton?: string;
  };
};

export const PrivacyPanel: React.FC<PrivacyPanelProps> = ({
  visible,
  password,
  disabled = false,
  isPasswordValid,
  onPasswordChange,
  onSubmit,
  classes,
}) => {
  return (
    <div
      className={`${stylesAnim.collapseWrap} ${visible ? stylesAnim.open : ''}`}
    >
      <div className={`d-flex flex-column mt-2 w-100 gap-2`}>
        <div className={`d-flex flex-row flex-nowrap align-items-center`}>
          <label htmlFor="password-input" className="text-color-blue me-2">
            Пароль:
          </label>
          <input
            id="password-input"
            type="password"
            maxLength={10}
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            disabled={disabled}
            className="form-control"
            // placeholder="до 10 символов"
          />
          <div className="reg_helper">
            <FontAwesomeIcon
              icon={faCircleInfo}
              style={{ color: '#4EB5B5', fill: '#4EB5B5' }}
            />
            <div className="reg_helper-modal">
              <ul>
                <li>Не менее 3 и не более 10 символов;</li>
                <li>Только латинские буквы и арабские цифры;</li>
                <li>Без пробелов.</li>
              </ul>
            </div>
          </div>
        </div>
        <Button
          className={classes?.submitButton}
          onClick={onSubmit}
          disabled={!isPasswordValid}
        >
          Установить пароль
        </Button>
      </div>
    </div>
  );
};
