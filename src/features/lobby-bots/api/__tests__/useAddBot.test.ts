import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAddBot } from '../useAddBot';
import { wsManager } from '@/websocket/WsManager';

// Mock wsManager
vi.mock('@/websocket/WsManager', () => ({
  wsManager: {
    send: vi.fn(),
  },
}));

describe('useAddBot hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call wsManager.send with the correct payload', () => {
    const { result } = renderHook(() => useAddBot());

    act(() => {
      result.current.addBot();
    });

    expect(wsManager.send).toHaveBeenCalledTimes(1);
    expect(wsManager.send).toHaveBeenCalledWith({
      command: 'add_bot',
      bot: true,
    });
  });
});
