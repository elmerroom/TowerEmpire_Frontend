import { useCallback } from 'react';
import { wsManager } from '@/websocket/WsManager';

export const useAddBot = () => {
  const addBot = useCallback(() => {
    wsManager.send({ command: 'add_bot', bot: true });
  }, []);

  return { addBot };
};
