import { useEffect, useCallback, useState } from 'react';

/**
 * @param {{ showWarning: (args: {title:string, text:string, redirectPath?:string}) => void }} params
 */
export function useWebSocketErrorHandler({ showWarning }) {
  const [wsError, setWsError] = useState(null);
  const [appError, setAppError] = useState(null);

  const resetWsError = useCallback(() => setWsError(null), []);
  const resetAppError = useCallback(() => setAppError(null), []);

  const handleWsLevelError = useCallback(
    errObj => {
      if (!errObj) return;
      showWarning({
        title: 'ошибка соединения',
        text: 'соединение закрылось. Что-то явно пошло не так :(',
        redirectPath: '/',
      });
    },
    [showWarning],
  );

  const handleAppLevelError = useCallback(
    errObj => {
      if (!errObj) return;
      if (typeof errObj === 'string') {
        showWarning({ title: 'Ошибка', text: errObj, redirectPath: '/' });
        return;
      }

      const code = String(errObj.code || '').toLowerCase();
      const msg = errObj.string || 'Попробуйте ещё раз позже';

      switch (code) {
        case 'invalid':
          showWarning({
            title: 'Невозможно войти в комнату',
            text: msg,
            redirectPath: '/',
          });
          break;
        case 'room_not_found':
        case 'room-not-found':
        case 'room_notfound':
        case 'roomnotfound':
          showWarning({
            title: 'Комната не найдена',
            text: msg,
            redirectPath: '/',
          });
          break;
        default:
          showWarning({
            title: 'Ошибка сервера',
            text: msg,
            redirectPath: '/',
          });
          break;
      }
    },
    [showWarning],
  );

  useEffect(() => {
    if (wsError) {
      handleWsLevelError(wsError);
    }
  }, [wsError, handleWsLevelError]);

  useEffect(() => {
    if (appError) {
      handleAppLevelError(appError);
    }
  }, [appError, handleAppLevelError]);

  return {
    wsError,
    appError,
    setWsError,
    setAppError,
    resetWsError,
    resetAppError,
  };
}
