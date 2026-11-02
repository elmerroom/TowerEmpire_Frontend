/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useStore } from 'react-redux';
import { wsManager, type ReadyState } from '@/websocket/WsManager';
import { env } from '@/shared/config/env';

type WsContext = {
  send: (data: any) => Promise<void>;
  status: ReadyState;
  isOnline: boolean;
  lastMessage: any;
};
const Ctx = createContext<WsContext | null>(null);

type Props = {
  lobbyId: number | string | null | undefined;
  userToken: string | null | undefined;
  isPrivate?: boolean | null;
  children: React.ReactNode;
};

const LOBBY_WS_BASE = env.VITE_WS_URL;

export default function WsRootProvider({
  lobbyId,
  userToken,
  children,
}: Props) {
  const reduxDispatch = useDispatch();
  const store = useStore();

  useEffect(() => {
    wsManager.setDispatch(reduxDispatch);
    wsManager.setGetState(store.getState);
    return () => {
      wsManager.setDispatch(undefined as any);
      wsManager.setGetState(undefined as any);
    };
  }, [reduxDispatch, store]);

  const [status, setStatus] = useState<ReadyState>(wsManager.status);
  const [lastMessage, setLastMessage] = useState<any>(wsManager.lastMessage);

  useEffect(() => {
    const unsubscribe = wsManager.subscribeStatus(setStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = wsManager.subscribeMessages(setLastMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  const activeUrlRef = useRef<string | null>(null);
  const connectedRef = useRef<{
    lobbyId: string | number | null;
    userToken: string | null;
  }>({ lobbyId: null, userToken: null });
  const currentUrl = useMemo(() => {
    if (!lobbyId || !userToken) {
      activeUrlRef.current = null;
      connectedRef.current = { lobbyId: null, userToken: null };
      return null;
    }

    if (
      activeUrlRef.current &&
      connectedRef.current.lobbyId === lobbyId &&
      connectedRef.current.userToken === userToken
    ) {
      return activeUrlRef.current;
    }

    const url = `${LOBBY_WS_BASE}${lobbyId}/${userToken}/`;

    activeUrlRef.current = url;
    connectedRef.current = { lobbyId, userToken };
    return url;
  }, [lobbyId, userToken]);

  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUrl) {
      wsManager.disconnect(1000, 'no url');
      prevUrlRef.current = null;
      return;
    }

    // Only disconnect if we're switching to a DIFFERENT URL
    if (prevUrlRef.current && prevUrlRef.current !== currentUrl) {
      wsManager.disconnect(1000, 'switching lobby');
    }

    prevUrlRef.current = currentUrl;
    wsManager.connect(currentUrl);
  }, [currentUrl]);

  const send = useCallback(async (payload: any) => {
    wsManager.send(payload);
  }, []);

  const ctxValue = useMemo<WsContext>(
    () => ({
      send,
      status,
      isOnline: status === 'open',
      lastMessage,
    }),
    [send, status, lastMessage],
  );

  return <Ctx.Provider value={ctxValue}>{children}</Ctx.Provider>;
}

export function useWebSocket() {
  return (
    useContext(Ctx) ?? {
      send: async () => {},
      status: 'idle' as ReadyState,
      isOnline: false,
      lastMessage: null,
    }
  );
}
