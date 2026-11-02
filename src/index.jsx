import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './components/helpers/toast_notification';
import { store } from './store/store';
import App from './App';
import './css/bootstrap.css';
import './css/main.scss';
import { registerLobbyHandlers } from '@/entities/lobby/ws.lobbyhandlers';
import { registerGameBjHandlers } from '@/entities/game/model/ws.gameBjHandlers';
import { registerGameFmHandlers } from '@/entities/game/model/ws.gameFmHandlers';
import { registerGameHffHandlers } from '@/entities/game/model/ws.gameHffHandlers';
import { wsManager } from './websocket/WsManager';

registerLobbyHandlers();
registerGameBjHandlers();
registerGameFmHandlers();
registerGameHffHandlers();
wsManager.setDispatch(store.dispatch);

const root = ReactDOM.createRoot(document.getElementById('root'));

// Инициализация MSW в dev-режиме перед рендером
// async function prepare() {
//   if (import.meta.env.DEV) {
//     const { worker } = await import('./mocks/browser');
//     await worker.start({ onUnhandledRequest: 'warn' });
//   }
// }

// prepare().then(() => {
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Provider store={store}>
          <ToastProvider>
            <App />
          </ToastProvider>
        </Provider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
// });
