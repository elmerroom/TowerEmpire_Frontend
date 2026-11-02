import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { setWarningService } from '@/websocket/warningService';

const initialWarning = {
  id: 0,
  title: '',
  text: '',
  redirectPath: '',
  theme: '', // 'game' | 'lobby' | 'info"
  onConfirm: null,
  confirmText: '',
};

// eslint-disable-next-line react-refresh/only-export-components
export const WarningContext = createContext({
  warning: initialWarning,
  showWarning: _data => {},
  clearWarning: () => {},
});

export const WarningProvider = ({ children }) => {
  const [warning, setWarning] = useState(initialWarning);
  const userId = useSelector(state => state.user?.userId ?? null);
  const theme = useSelector(state => state.modal.gameMode);

  // Сбрасываем warning каждый раз, когда меняется userId
  useEffect(() => {
    setWarning(initialWarning);
  }, [userId]);

  // Сбрасываем warning при выходе из игры (gameMode: truthy → false)
  const prevThemeRef = useRef(theme);
  useEffect(() => {
    if (prevThemeRef.current && !theme) {
      setWarning(initialWarning);
    }
    prevThemeRef.current = theme;
  }, [theme]);

  // показываем предупреждение
  const showWarning = useCallback(
    data => {
      setWarning({
        title: data.title || '',
        text: data.text || '',
        redirectPath: data.redirectPath || '',
        theme: theme,
        onConfirm: data.onConfirm || null,
        confirmText: data.confirmText || '',
      });
    },
    [theme],
  );
  // сбрасываем на initial
  const clearWarning = useCallback(() => {
    setWarning(initialWarning);
  }, []);

  // Регистрируем showWarning в глобальном сервисе для доступа из WebSocket handlers
  useEffect(() => {
    setWarningService(showWarning);
    return () => {
      setWarningService(null);
    };
  }, [showWarning]);

  return (
    <WarningContext.Provider value={{ warning, showWarning, clearWarning }}>
      {children}
    </WarningContext.Provider>
  );
};
