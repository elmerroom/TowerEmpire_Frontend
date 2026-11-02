import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../ui/Button';

export const ModalUI = ({
  onClose,
  onButtonClose,
  isVisible,
  children,
  closeButton,
}) => {
  return (
    <div
      onClick={event => onClose(event)}
      className={`
        modal-wrapper
        ${isVisible ? 'modal-wrapper_show' : 'modal-wrapper_hide'}
        `}
    >
      <div className={`modal-wrapper__modal-main`}>
        {closeButton && (
          <Button
            onClick={onButtonClose}
            className="modal-wrapper__modal-main__close-button"
          >
            <FontAwesomeIcon icon={faXmark} />
          </Button>
        )}
        {children}
      </div>
    </div>
  );
};
