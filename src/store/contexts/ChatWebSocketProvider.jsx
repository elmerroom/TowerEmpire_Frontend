import { createContext, useContext, useState } from 'react';
import useChatWebSocket from '@/components/helpers/hooks/useChatWebSocket';
import { wsChatBase as BASE_CHAT_URL } from '@/shared/config/endpoints';

const ChatWebSocketContext = createContext();

export const ChatWebSocketProvider = ({ children, lobbyId, userToken }) => {
  const [chatType, setChatType] = useState('ROOM'); // По умолчанию gameChat
  const currentSocketUrl = `${BASE_CHAT_URL}${lobbyId}/${userToken}`;
  const { isOnline, sendMessage } = useChatWebSocket(
    currentSocketUrl,
    chatType,
  );

  // Функция для отправки сообщения с указанием типа чата
  const sendChatMessage = (message, type) => {
    setChatType(type || 'ROOM');
    return sendMessage(message);
  };

  return (
    <ChatWebSocketContext.Provider
      value={{
        isOnline,
        sendMessage: sendChatMessage,
        setChatType,
      }}
    >
      {children}
    </ChatWebSocketContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useChatWS = () => useContext(ChatWebSocketContext);
