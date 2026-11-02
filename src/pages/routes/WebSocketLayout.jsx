import { Outlet, useParams, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import WsRootProvider from '@/store/contexts/WsRootProvider';
import { ChatWebSocketProvider } from '../../store/contexts/ChatWebSocketProvider';
import { WarningProvider, WarningModal } from '../../features/warnings/index';
import {
  PlayerActionProvider,
  PlayerActionModal,
} from '../../features/player-action-modal';
import { InteractionProvider } from '@/features/interaction-orchestrator';
import { getAccessToken } from '../../entities/user/model/slice';
import { navigationService } from '@/websocket/navigationService';

export const WebSocketLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userToken = useSelector(getAccessToken);

  // Register navigate function with the navigation service
  useEffect(() => {
    navigationService.setNavigate(navigate);
    return () => {
      navigationService.setNavigate(null);
    };
  }, [navigate]);

  // Если нет id в params или нет токена – сразу возвращаем <Navigate>
  if (!id || !userToken) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <WarningProvider>
      <WarningModal />
      <WsRootProvider lobbyId={parseInt(id)} userToken={userToken}>
        <InteractionProvider>
          <PlayerActionProvider>
            <PlayerActionModal />
            <ChatWebSocketProvider lobbyId={parseInt(id)} userToken={userToken}>
              <Outlet />
            </ChatWebSocketProvider>
          </PlayerActionProvider>
        </InteractionProvider>
      </WsRootProvider>
    </WarningProvider>
  );
};

export default WebSocketLayout;
