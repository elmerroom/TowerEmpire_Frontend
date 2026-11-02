import { createContext, useCallback, useMemo, useState } from 'react';
import { ToastNotification } from './ui/toast_notification';

export const ToastContext = createContext({
  showToast: message => {},
});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
  });

  const showToast = useCallback(message => {
    console.log('showToast', message);
    setToast({
      show: true,
      message,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast({
      show: false,
      message: '',
    });
  }, []);

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <ToastNotification
        show={toast.show}
        message={toast.message}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};
