/**
 * Warning Service - глобальный сервис для показа модальных окон из WebSocket handlers
 * Позволяет вызывать showWarning из handlers, которые работают вне React компонентов
 */

type ShowWarningFn = (data: {
  title?: string;
  text: string;
  redirectPath?: string;
  onConfirm?: (() => void) | null;
  confirmText?: string;
}) => void;

let warningService: ShowWarningFn | null = null;

/**
 * Устанавливает функцию showWarning из WarningContext
 * Вызывается из WarningProvider
 */
export const setWarningService = (fn: ShowWarningFn | null): void => {
  warningService = fn;
};

/**
 * Показывает модальное окно с предупреждением
 * Может быть вызвано из WebSocket handlers
 */
export const showWarning = (data: {
  title?: string;
  text: string;
  redirectPath?: string;
  onConfirm?: (() => void) | null;
  confirmText?: string;
}): void => {
  if (warningService) {
    warningService(data);
  } else {
    console.warn(
      '[WarningService] showWarning called but service not initialized',
    );
  }
};
