import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useWebSocket } from '@/store/contexts/WsRootProvider';
import { getInteractionIdFromPayload } from '@/shared/lib/validation/websocket';

export type InteractionStatus = 'idle' | 'pending' | 'success' | 'error';
export type InteractionType = 'modal' | 'toast' | 'confirm';

export interface Interaction {
  id: string;
  key: string;
  type: InteractionType;
  status: InteractionStatus;
  payload?: unknown;
  error?: string;
  expectedEvents?: string[];
  createdAt: number;
  updatedAt: number;
}

type LegacyModalRegistration = {
  open: (payload?: unknown) => void;
  close: () => void;
};

type StartInteractionOptions = {
  type?: InteractionType;
  payload?: unknown;
  expectedEvents?: string[];
};

export interface InteractionContextValue {
  activeInteractions: Record<string, Interaction>;
  startInteraction: (key: string, options?: StartInteractionOptions) => string;
  updateInteraction: (id: string, update: Partial<Interaction>) => void;
  finishInteraction: (id: string) => void;
  failInteraction: (id: string, error: string) => void;
  registerLegacyModal: (
    key: string,
    openFn: (payload?: unknown) => void,
    closeFn: () => void,
  ) => () => void;
  openLegacyModal: (key: string, payload?: unknown) => void;
  closeLegacyModal: (key: string) => void;
}

const noop = () => {};

const InteractionContext = createContext<InteractionContextValue>({
  activeInteractions: {},
  startInteraction: () => '',
  updateInteraction: noop,
  finishInteraction: noop,
  failInteraction: noop,
  registerLegacyModal: () => noop,
  openLegacyModal: noop,
  closeLegacyModal: noop,
});

const createInteractionId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `interaction-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const InteractionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeInteractions, setActiveInteractions] = useState<
    Record<string, Interaction>
  >({});
  const { lastMessage } = useWebSocket();
  const legacyModalRegistryRef = useRef<
    Record<string, LegacyModalRegistration>
  >({});

  const startInteraction = useCallback(
    (key: string, options?: StartInteractionOptions): string => {
      const id = createInteractionId();
      const nextInteraction: Interaction = {
        id,
        key,
        type: options?.type ?? 'modal',
        status: 'pending',
        payload: options?.payload,
        expectedEvents: options?.expectedEvents ?? [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setActiveInteractions(prev => ({
        ...prev,
        [id]: nextInteraction,
      }));

      return id;
    },
    [],
  );

  const updateInteraction = useCallback(
    (id: string, update: Partial<Interaction>) => {
      setActiveInteractions(prev => {
        const current = prev[id];
        if (!current) {
          return prev;
        }

        return {
          ...prev,
          [id]: {
            ...current,
            ...update,
            updatedAt: Date.now(),
          },
        };
      });
    },
    [],
  );

  const finishInteraction = useCallback((id: string) => {
    setActiveInteractions(prev => {
      if (!prev[id]) {
        return prev;
      }

      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const failInteraction = useCallback(
    (id: string, error: string) => {
      updateInteraction(id, {
        status: 'error',
        error,
      });
    },
    [updateInteraction],
  );

  const registerLegacyModal = useCallback(
    (key: string, openFn: (payload?: unknown) => void, closeFn: () => void) => {
      legacyModalRegistryRef.current[key] = {
        open: openFn,
        close: closeFn,
      };

      return () => {
        delete legacyModalRegistryRef.current[key];
      };
    },
    [],
  );

  const openLegacyModal = useCallback((key: string, payload?: unknown) => {
    legacyModalRegistryRef.current[key]?.open(payload);
  }, []);

  const closeLegacyModal = useCallback((key: string) => {
    legacyModalRegistryRef.current[key]?.close();
  }, []);

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== 'object') {
      return;
    }

    const message = lastMessage as Record<string, unknown>;
    const event =
      typeof message.event === 'string'
        ? message.event
        : typeof message.type === 'string'
          ? message.type
          : null;

    if (!event) {
      return;
    }

    const interactionId = getInteractionIdFromPayload(message);

    setActiveInteractions(prev => {
      const next = { ...prev };
      let updated = false;

      const resolveInteraction = (id: string) => {
        const interaction = next[id];
        if (!interaction || interaction.status !== 'pending') {
          return;
        }

        next[id] = {
          ...interaction,
          status: 'success',
          updatedAt: Date.now(),
        };
        updated = true;
      };

      if (interactionId && next[interactionId]) {
        resolveInteraction(interactionId);
      } else {
        for (const [id, interaction] of Object.entries(next)) {
          if (
            interaction.status === 'pending' &&
            interaction.expectedEvents?.includes(event)
          ) {
            resolveInteraction(id);
            break;
          }
        }
      }

      return updated ? next : prev;
    });
  }, [lastMessage]);

  const value = useMemo<InteractionContextValue>(
    () => ({
      activeInteractions,
      startInteraction,
      updateInteraction,
      finishInteraction,
      failInteraction,
      registerLegacyModal,
      openLegacyModal,
      closeLegacyModal,
    }),
    [
      activeInteractions,
      startInteraction,
      updateInteraction,
      finishInteraction,
      failInteraction,
      registerLegacyModal,
      openLegacyModal,
      closeLegacyModal,
    ],
  );

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteraction = () => useContext(InteractionContext);
