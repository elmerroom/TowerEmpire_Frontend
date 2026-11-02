import { useEffect } from 'react';
import { wsManager } from '@/websocket/WsManager';
import { channel } from 'diagnostics_channel';

/**
 * Активирует виртуальную группу сообщений на время жизни компонента.
 * Не открывает/закрывает физический сокет — это делает провайдер по URL.
 */
export function useChannel(groupKey: string) {
  useEffect(() => {
    wsManager.activateGroup(groupKey);
    return () => wsManager.deactivateGroup(groupKey);
  }, [groupKey]);
}
