/**
 * Хук для управления паролем комнаты через sessionStorage.
 *
 * Пароль сохраняется в sessionStorage в формате base64 для минимальной защиты от прямого чтения.
 * При получении автоматически декодируется обратно в строку.
 *
 * Привязан к конкретному lobbyId, создавая ключ вида `lobby-password-<id>`.
 *
 * @example
 * const { set, get, clear } = useLobbyPassword();
 * set(123, 'secret'); // сохраняет пароль
 * const pw = get(123); // вернёт 'secret'
 * clear(123); // удалит сохранённый пароль
 *
 * @returns {Object} Возвращает объект с методами:
 * - get(lobbyId: number | string): string | null — получить пароль (или null, если нет)
 * - set(lobbyId: number | string, password: string): void — сохранить пароль
 * - clear(lobbyId: number | string): void — удалить пароль
 */

export const useLobbyPassword = () => {
  const passwordKey = lobbyId => `lobby-password-${lobbyId}`;

  const set = (lobbyId, password) => {
    try {
      const encoded = btoa(password);
      sessionStorage.setItem(passwordKey(lobbyId), encoded);
    } catch (err) {
      console.error(`[lobbyPassword] Ошибка кодирования пароля:`, err);
    }
  };

  const get = lobbyId => {
    try {
      const encoded = sessionStorage.getItem(passwordKey(lobbyId));
      return encoded ? atob(encoded) : null;
    } catch (err) {
      console.error(`[lobbyPassword] Ошибка декодирования пароля:`, err);
      return null;
    }
  };

  const clear = lobbyId => {
    try {
      sessionStorage.removeItem(passwordKey(lobbyId));
    } catch (err) {
      console.error(`[lobbyPassword] Ошибка при удалении пароля:`, err);
    }
  };

  return { get, set, clear };
};
