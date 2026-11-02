import { useCallback, useEffect, useRef, useState } from 'react';
import { catAnimations, catBoom } from '../const/animation';

export const useCatAnimator = (initialKey = 'master') => {
  const flashRef = useRef(null);
  const [currentAnim, setCurrentAnim] = useState(initialKey);
  const [nextAnim, setNextAnim] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const changeAnimation = useCallback((newKey, options = {}) => {
    const { withFlash = true, probability = 1 } = options;

    if (Math.random() > probability) return;

    if (withFlash) {
      setNextAnim(newKey);
      setIsFlashing(true);
      if (flashRef.current) {
        flashRef.current.currentTime = 0;
        flashRef.current.play();
      }
    } else {
      setCurrentAnim(newKey);
    }
  }, []);

  useEffect(() => {
    const flash = flashRef.current;
    if (!flash) return;

    const onFlashEnd = () => {
      if (nextAnim) {
        setCurrentAnim(nextAnim);
        setNextAnim(null);
      }
      setIsFlashing(false);
    };

    flash.addEventListener('ended', onFlashEnd);
    return () => flash.removeEventListener('ended', onFlashEnd);
  }, [nextAnim]);

  return {
    currentAnimSrc: catAnimations[currentAnim],
    flashSrc: catBoom.flash,
    flashRef,
    isFlashing,
    changeAnimation,
  };
};
