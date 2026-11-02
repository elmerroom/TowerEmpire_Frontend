// import { useState, useCallback } from 'react';
// import useWebSocket from 'react-use-websocket';

// export const useLobbyWebSocket = currentSocketUrl => {
//   const [isOnline, setOnline] = useState(false);
//   const [wsError, setWsError] = useState();

//   const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(
//     currentSocketUrl,
//     {
//       shouldReconnect: closeEvent => {
//         if (closeEvent.code !== 1000) {
//           setWsError({ code: closeEvent.code, reason: closeEvent.reason });
//         }
//         return false;
//       },
//       onOpen: () => {
//         setOnline(true);
//         setWsError(null);
//       },
//       onClose: event => {
//         setOnline(false);
//         console.log('WebSocket connection closed:', event.code, event.reason);
//         if (event.code !== 1000) {
//           setWsError({ code: event.code, reason: event.reason });
//         }
//       },
//       onError: error => {
//         console.error('WebSocket error occurred:', error.message);
//         setWsError({ code: 'WS_ERROR', reason: error.message });
//       },
//     },
//   );

//   const readyStateString = {
//     0: 'CONNECTING',
//     1: 'OPEN',
//     2: 'CLOSING',
//     3: 'CLOSED',
//   }[readyState];

//   // Функция для отправки сообщения на сервер
//   const sendMessage = useCallback(
//     message => {
//       return new Promise((resolve, reject) => {
//         if (readyState === 1) {
//           // WebSocket открыт (readyState === 1)
//           try {
//             sendJsonMessage(message);
//             resolve();
//           } catch (error) {
//             reject(error);
//           }
//         } else {
//           reject(new Error('Websocket is not open'));
//         }
//       });
//     },
//     [readyState, sendJsonMessage],
//   );

//   return {
//     isOnline,
//     readyStateString,
//     sendMessage,
//     lastMessage: lastJsonMessage,
//     wsError,
//   };
// };

// export default useLobbyWebSocket;
