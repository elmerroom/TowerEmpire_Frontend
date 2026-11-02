import { useContext } from 'react';
import { PlayerActionContext } from '../context/PlayerActionContext';

/**
 * Хук для доступа к контексту управления модальным окном действий над игроком.
 *
 * @example
 * const { openKickModal, openPromoteModal } = usePlayerAction();
 *
 * // Открыть модалку кика
 * openKickModal({ id: 123, username: 'PlayerName' });
 *
 * // Открыть модалку передачи прав хоста
 * openPromoteModal({ id: 123, username: 'PlayerName' });
 */
export const usePlayerAction = () => useContext(PlayerActionContext);

export default usePlayerAction;
