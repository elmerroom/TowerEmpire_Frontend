import { useEffect, useRef } from 'react';

type ScrollElement = HTMLElement | null;

type DragonsParallaxControllerProps = {
  scrollElementRef: React.RefObject<ScrollElement>;
  targetElementRef: React.RefObject<HTMLElement | null>;
};

export const DragonsParallaxController: React.FC<
  DragonsParallaxControllerProps
> = ({ scrollElementRef, targetElementRef }) => {
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    const targetElement = targetElementRef.current;

    if (!scrollElement || !targetElement) {
      return undefined;
    }

    const update = () => {
      rafIdRef.current = null;

      const scrollTop = scrollElement.scrollTop;
      targetElement.style.setProperty(
        '--dragons-parallax-y',
        `${Math.round(scrollTop * -0.06)}px`,
      );
      targetElement.style.setProperty(
        '--bg-parallax-y',
        `${Math.round(scrollTop * -0.02)}px`,
      );
    };

    const onScroll = () => {
      if (rafIdRef.current !== null) {
        return;
      }

      rafIdRef.current = window.requestAnimationFrame(update);
    };

    update();
    scrollElement.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      scrollElement.removeEventListener('scroll', onScroll);
    };
  }, [scrollElementRef, targetElementRef]);

  return null;
};

type DragonSideProps = {
  side: 'left' | 'right';
};

export const DragonSide: React.FC<DragonSideProps> = ({ side }) => {
  return (
    <div className={`dragon-side dragon-side--${side}`} aria-hidden="true">
      <img
        className="dragon-side__img"
        src="/img/dragon.svg"
        alt=""
        width={200}
        height={300}
        decoding="async"
        loading="eager"
        draggable={false}
      />
    </div>
  );
};
