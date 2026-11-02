import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

export const RegisterBanner = () => {
  return (
    <div className="login-header_wrapper__info">
      <div className="text-color-blue">
        <span>Зарегистрируйтесь, чтобы получить преимущества</span>
        <div className="reg_helper">
          <FontAwesomeIcon icon={faCircleInfo} />
          <div className="reg_helper-modal">
            <ul>
              <li>• Доступ к статистике игр</li>
              <li>• Возможность персонализировать профиль</li>
              <li>• Уровни профиля</li>
              <li>• Система достижений</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
