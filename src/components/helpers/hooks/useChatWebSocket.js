import { useEffect, useState, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import { useDispatch } from 'react-redux';
import { escapeHtml } from '../help_functions';
import {
  setRoomChat,
  setGameChat,
} from '../../../store/slices/lobby/lobbyUiSlice';
// import { useCommandProcessor } from '../../../utils/useCommandProcessor';

const READY_STATE_OPEN = 1;

const useChatWebSocket = (currentSocketUrl, chatType) => {
  const dispatch = useDispatch();
  //const processCommand = useCommandProcessor().processCommand;
  const [isOnline, setOnline] = useState(false);
  const lastProcessedMessage = useRef(null);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    currentSocketUrl,
    {
      shouldReconnect: () => false,
      onOpen: () => setOnline(true),
      onClose: () => setOnline(false),
    },
  );

  useEffect(() => {
    let payload = lastJsonMessage;
    if (!payload) return;
    // if (payload && typeof payload === 'object' && 'event' in payload) {
    //   // Это точно не чат: пропускаем без побочных действий
    //   return;
    // }
    if (typeof payload === 'string') {
      payload = { message: payload };
    }
    // ⚠️ Пропускаем только настоящие чатовые сообщения — когда есть строковое поле `message`
    const messageText = payload.message;
    if (typeof messageText !== 'string') {
      // сюда попадут lobby/game события вида { event: 'change_private', ... } — просто игнорируем
      return;
    }

    // if (messageText.startsWith('/cmd_')) {
    //   // Это команда — обрабатываем, но не добавляем в чат
    //   processCommand(messageText);
    //   lastProcessedMessage.current = messageText;
    //   return;
    // }

    // Обычное чат-сообщение — отправляем в нужный чат
    if (chatType === 'ROOM') {
      dispatch(setRoomChat(payload));
    } else {
      dispatch(setGameChat(payload));
    }
    lastProcessedMessage.current = messageText;
  }, [dispatch, chatType, lastJsonMessage]);

  const readyStateString = {
    0: 'CONNECTING',
    1: 'OPEN',
    2: 'CLOSING',
    3: 'CLOSED',
  }[readyState];

  const sendMessage = message => {
    return new Promise((resolve, reject) => {
      if (readyState === READY_STATE_OPEN) {
        try {
          sendJsonMessage({
            message: escapeHtml(message),
            chatType: chatType, // Добавляем тип чата в сообщение
          });
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('Websocket is not open'));
      }
    });
  };
  // Отправка системной команды через чат (на самом деле обычное сообщение)
  const sendCommand = command => {
    return new Promise((resolve, reject) => {
      if (readyState === READY_STATE_OPEN) {
        // Отправляем сообщение с префиксом '/cmd_'
        try {
          sendJsonMessage({
            message: `/cmd_${command}`,
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('Websocket is not open'));
      }
    });
  };

  useEffect(() => {}, [readyState, readyStateString]);

  return { isOnline, readyStateString, sendMessage, sendCommand };
};

export default useChatWebSocket;
