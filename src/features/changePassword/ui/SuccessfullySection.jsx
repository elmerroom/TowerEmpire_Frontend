import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { Button } from '../../../shared/ui/Button';

/**
 * Секция для ввода email и отправки кода для сброса пароля.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.response - Объект с данными ответа (type, message).
 * @param {Function} props.onSuccess - Функция для возврата на главное окно.
 * @returns {JSX.Element} Секция подтверждения смены пароля.
 */
export const SuccessfullySection = ({ response, onSuccess }) => {
  const getTitle = () => {
    if (!response) return 'Статус операции';
    return response.type === 'success' ? 'Успешно!' : 'Упс!';
  };

  const getIconStyle = () => ({
    color: response?.type === 'success' ? '#28a745' : '#dc3545',
    fontSize: '4rem',
    margin: '20px 0',
  });

  return (
    <div className="successfully-section d-flex flex-column align-items-center text-center">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="my-modal-title title-white mx-auto">{getTitle()}</h1>
      </div>
      <ModalSVG />
      <FontAwesomeIcon
        icon={
          response?.type === 'success' ? faCheckCircle : faExclamationTriangle
        }
        style={getIconStyle()}
      />
      <p
        className="mb-3"
        style={{
          color: response?.type === 'success' ? '#28a745' : '#dc3545',
          fontSize: '1.1rem',
        }}
      >
        {response?.message}
      </p>
      <div className="d-flex justify-content-center">
        <Button variant="submit" onClick={onSuccess}>
          Подтвердить
        </Button>
      </div>
    </div>
  );
};
