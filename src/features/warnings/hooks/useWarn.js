import { useWarning } from './useWarning';

/**
 * Хук-обёртка над showWarning для унифицированного вызова модалок.
 * Возвращает пресеты: ok, error, confirm.
 *
 * @returns {{
 *   ok: (title: string, text: string) => void,
 *   error: (text: string, title?: string) => void,
 *   confirm: (title: string, text: string, onConfirm: Function, confirmText?: string) => void
 * }}
 */
export const useWarn = () => {
  const { showWarning } = useWarning();

  /** Простое сообщение с кнопкой «Ок». */
  const ok = (title, text) =>
    showWarning({ title, text, confirmText: 'Ок' }, { mode: 'replace' });

  /** Ошибка (title по умолчанию «Ошибка») с кнопкой «Ок». */
  const error = (text, title = 'Ошибка') =>
    showWarning({ title, text, confirmText: 'Ок' }, { mode: 'replace' });

  /** Подтверждение с действием. */
  const confirm = (title, text, onConfirm, confirmText = 'Подтвердить') =>
    showWarning({ title, text, onConfirm, confirmText }, { mode: 'replace' });

  return { ok, error, confirm };
};
