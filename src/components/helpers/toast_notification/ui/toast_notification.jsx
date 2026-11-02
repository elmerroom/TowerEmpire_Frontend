import { useEffect, useRef } from 'react';
import { Toast } from 'bootstrap';
import styles from './toast_notification.module.scss';
import { Button } from '../../../../shared/ui/Button';

export const ToastNotification = ({ show, message, onClose }) => {
  const toastRef = useRef(null);
  const bsToastRef = useRef(null);

  useEffect(() => {
    if (show && toastRef.current) {
      const toastElement = toastRef.current;
      const bsToast = new Toast(toastRef.current, {
        delay: 3000,
        autohide: true,
      });
      bsToastRef.current = bsToast;
      bsToast.show();

      const handleHidden = () => {
        if (onClose) onClose();
      };

      toastElement.addEventListener('hidden.bs.toast', handleHidden);

      return () => {
        if (toastElement) {
          toastElement.removeEventListener('hidden.bs.toast', handleHidden);
        }
      };
    }
  }, [show, onClose]);

  return (
    // <div className="position-fixed bottom-0 end-0 p-3">
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 999 }}
    >
      <div
        className={`toast ${styles.toast} align-items-center border-0`}
        ref={toastRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className={`toast-body ${styles.toast__body}`}>{message}</div>
          <Button
            className="toast-close-btn"
            onClick={() => bsToastRef.current?.hide()}
            aria-label="Закрыть"
          >
            <svg>
              <use href="#close" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
