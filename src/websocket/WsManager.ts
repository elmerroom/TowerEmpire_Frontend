/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateIncomingWsMessage } from '@/shared/lib/validation/websocket';
export type ReadyState = 'idle' | 'connecting' | 'open' | 'closed';

export interface WsManagerOptions {
  /** Optional payload sent as heartbeat while the socket stays open */
  heartbeat?: string;
  /** Heartbeat interval in milliseconds; <= 0 disables keep-alive */
  heartbeatIntervalMs?: number;
  /** Maximum reconnect backoff in milliseconds */
  maxBackoffMs?: number;
}

const DEFAULT_OPTS: Required<WsManagerOptions> = {
  heartbeat: '',
  heartbeatIntervalMs: 0,
  maxBackoffMs: 15000,
};

function safeParse(raw: any) {
  try {
    if (raw == null) return null;
    if (typeof raw === 'string') return JSON.parse(raw);
    if (raw instanceof ArrayBuffer)
      return JSON.parse(new TextDecoder().decode(raw));
    return JSON.parse(String(raw));
  } catch {
    return null;
  }
}

type HandlerCtx<D, S = any> = {
  dispatch: D;
  getState: () => S;
  ws: WsManager<D, S>;
};
type Handler<D, S = any> = (ctx: HandlerCtx<D, S>, msg: any) => void;
type HandlersMap<D, S = any> = Record<string, Handler<D, S>>;

export class WsManager<D = any, S = any> {
  private _dispatch: D | null = null;
  private _getState: (() => S) | null = null;

  private ws: WebSocket | null = null;
  private url: string | null = null;
  private state: ReadyState = 'idle';
  private opts: Required<WsManagerOptions>;

  private statusListeners = new Set<(s: ReadyState) => void>();
  private messageListeners = new Set<(msg: any) => void>();
  private lastMessageValue: any = null;

  private groups = new Map<string, HandlersMap<D, S>>();
  private activeGroups = new Map<string, number>();

  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options?: WsManagerOptions) {
    this.opts = { ...DEFAULT_OPTS, ...(options ?? {}) };
  }

  subscribeStatus(cb: (s: ReadyState) => void) {
    this.statusListeners.add(cb);
    cb(this.state);
    return () => this.statusListeners.delete(cb);
  }

  /** Subscribe to the raw WS payloads after they were parsed */
  subscribeMessages(cb: (msg: any) => void) {
    this.messageListeners.add(cb);
    if (this.lastMessageValue !== null) {
      try {
        cb(this.lastMessageValue);
      } catch {}
    }
    return () => this.messageListeners.delete(cb);
  }

  private notifyStatus() {
    for (const listener of this.statusListeners) {
      try {
        listener(this.state);
      } catch {}
    }
  }

  private notifyMessage(msg: any) {
    this.lastMessageValue = msg;
    for (const listener of this.messageListeners) {
      try {
        listener(msg);
      } catch {}
    }
  }

  private setState(next: ReadyState) {
    if (this.state === next) return;
    this.state = next;
    this.notifyStatus();
  }

  setDispatch(dispatch?: D | null) {
    this._dispatch = dispatch ?? null;
  }

  setGetState(getState?: (() => S) | null) {
    this._getState = getState ?? null;
  }

  get status() {
    return this.state;
  }

  get lastMessage() {
    return this.lastMessageValue;
  }

  registerGroup(key: string, handlers: HandlersMap<D, S>) {
    this.groups.set(key, handlers || ({} as any));
  }

  unregisterGroup(key: string) {
    this.groups.delete(key);
    this.activeGroups.delete(key);
  }

  // заменить методы:
  activateGroup(key: string) {
    const n = this.activeGroups.get(key) ?? 0;
    this.activeGroups.set(key, n + 1);
  }

  deactivateGroup(key: string) {
    const n = this.activeGroups.get(key) ?? 0;
    if (n <= 1) this.activeGroups.delete(key);
    else this.activeGroups.set(key, n - 1);
  }

  activate = this.activateGroup.bind(this);
  deactivate = this.deactivateGroup.bind(this);

  clearAllGroups() {
    this.groups.clear();
    this.activeGroups.clear();
  }

  connect(url: string) {
    if (!url) return;
    if (
      this.url === url &&
      (this.state === 'open' || this.state === 'connecting')
    ) {
      return;
    }
    this.url = url;
    this.openSocket();
  }

  disconnect(code?: number, reason?: string) {
    this.clearHeartbeat();
    const ws = this.ws;
    this.ws = null;
    this.url = null;
    this.reconnectAttempts = 0;

    if (ws && (this.state === 'connecting' || this.state === 'open')) {
      try {
        ws.close(code ?? 1000, reason ?? 'client disconnect');
      } catch {}
    }

    this.setState('closed');
  }

  send(data: any) {
    if (!this.ws || this.state !== 'open') return;
    try {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } catch {}
  }

  private openSocket() {
    if (!this.url) return;

    this.clearHeartbeat();
    this.setState('connecting');

    let socket: WebSocket;
    try {
      socket = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws = socket;

    socket.onopen = () => {
      this.setState('open');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    socket.onmessage = (ev: MessageEvent) => {
      const dispatchRef = this._dispatch;
      if (!dispatchRef) {
        console.debug('[WS] drop message: no dispatch is set');
        return;
      }

      // Проверяем, является ли сообщение простой строкой (не JSON)
      // Например, "Вас исключили из лобби"
      if (typeof ev.data === 'string' && !ev.data.trim().startsWith('{')) {
        // Это строка, а не JSON - обрабатываем как текстовое сообщение
        const messageText = ev.data.trim();
        if (messageText === 'Вас исключили из лобби') {
          // Создаем специальное событие для обработки исключения
          const kickMessage = {
            event: 'user_kicked_message',
            message: messageText,
          };
          this.notifyMessage(kickMessage);

          // Обрабатываем через handlers
          let handled = 0;
          const getState = this._getState || (() => ({}) as any);
          for (const [key] of this.activeGroups) {
            const group = this.groups.get(key);
            const handler = group?.['user_kicked_message'];
            if (!handler) continue;
            handled++;
            try {
              handler(
                { dispatch: dispatchRef, getState: getState, ws: this },
                kickMessage,
              );
            } catch (error) {
              console.error(
                `[WS] handler error in "${key}" for "user_kicked_message"`,
                error,
              );
            }
          }

          if (!handled) {
            console.warn('[WS] no handler for user_kicked_message');
          }
          return;
        }
        // Другие строковые сообщения игнорируем
        return;
      }

      const parsed = safeParse(ev.data);
      const validatedMessage = validateIncomingWsMessage(parsed);
      if (!validatedMessage.success) {
        console.warn('[WS] drop invalid message', {
          error: validatedMessage.error,
          raw: ev.data,
        });
        return;
      }

      const msg = validatedMessage.data;
      const kind = msg.event as string;

      this.notifyMessage(msg);

      let handled = 0;
      const getState = this._getState || (() => ({}) as any);
      for (const [key] of this.activeGroups) {
        const group = this.groups.get(key);
        const handler = group?.[kind];
        if (!handler) continue;
        handled++;
        try {
          handler({ dispatch: dispatchRef, getState: getState, ws: this }, msg);
        } catch (error) {
          console.error(`[WS] handler error in "${key}" for "${kind}"`, error);
        }
      }

      if (!handled) {
        console.warn('[WS] no handler matched', {
          kind,
          activeGroups: Array.from(this.activeGroups),
          availableGroups: Array.from(this.groups.keys()),
          msg,
        });
      }
    };

    socket.onerror = () => {
      /* noop: onclose will follow and update the status */
    };

    socket.onclose = () => {
      this.clearHeartbeat();
      this.setState('closed');

      if (this.url) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect() {
    if (!this.url) return;
    const attempt = ++this.reconnectAttempts;

    const backoff = Math.min(
      this.opts.maxBackoffMs,
      1000 * 2 ** Math.min(attempt, 4),
    );
    const jitter = Math.floor(Math.random() * 400);
    const delay = backoff + jitter;

    setTimeout(() => {
      if (!this.url) return;
      this.openSocket();
    }, delay);
  }

  private startHeartbeat() {
    if (
      !this.opts.heartbeat ||
      !this.opts.heartbeatIntervalMs ||
      this.opts.heartbeatIntervalMs <= 0
    ) {
      return;
    }

    this.clearHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      try {
        if (this.ws && this.state === 'open') {
          this.ws.send(this.opts.heartbeat);
        }
      } catch {}
    }, this.opts.heartbeatIntervalMs);
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export const wsManager = new WsManager({
  heartbeat: '',
  heartbeatIntervalMs: 0,
  maxBackoffMs: 15000,
});
