import { useEffect, useState } from 'react';

type InlineSpriteProps = {
  url?: string;
  defer?: boolean;
};

export const InlineSprite: React.FC<InlineSpriteProps> = ({
  url = '/sprite.svg',
  defer = true,
}) => {
  const [markup, setMarkup] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) {
          return;
        }
        const text = await response.text();
        if (!isCancelled) {
          setMarkup(text);
        }
      } catch {
        // ignore
      }
    };

    if (!defer) {
      void load();
      return () => {
        isCancelled = true;
      };
    }

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | null = null;
    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(() => {
        void load();
      });
    } else {
      idleId = window.setTimeout(() => {
        void load();
      }, 0);
    }

    return () => {
      isCancelled = true;
      if (idleId === null) {
        return;
      }

      if (typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [defer, url]);

  if (!markup) {
    return null;
  }

  return (
    <div
      style={{ display: 'none' }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
};
