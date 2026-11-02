import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPhase } from '../../../entities/game/model/gameBjSlice';
import { catBoom } from '../const/animation';
import { flashEnded } from '../model/animateSlice';
import { CatAnimationController } from './CatAnimationController';

export const CatAnimator = () => {
  const dispatch = useDispatch();
  const { currentAnimation, isFlashing } = useSelector(state => state.animate);
  const gamePhase = useSelector(state => selectPhase(state));
  const isSafari =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  useEffect(() => {
    const video = document.querySelector('.cat__animation');
    if (
      video &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent)
    ) {
      video.classList.add('cat__animation--mov');
    }
  }, [currentAnimation]);

  return (
    <div className={`cat ${gamePhase === 'finish_game' ? 'cat__finish' : ''}`}>
      <CatAnimationController />
      {/* Кот */}
      <video
        key={currentAnimation.key}
        width="100%"
        height="auto"
        loop
        muted
        autoPlay
        playsInline
        className={`cat__animation`}
        onError={e => console.error('Video playback error:', e)}
      >
        {isSafari ? (
          <source src={currentAnimation.mov} type='video/mp4; codecs="hvc1"' />
        ) : (
          <source src={currentAnimation.webm} type="video/webm" />
        )}
      </video>

      {/* Флэш */}
      {isFlashing && (
        <video
          src={isSafari ? catBoom.flash.mov : catBoom.flash.webm}
          loading="lazy"
          className={`cat__flash`}
          muted
          autoPlay
          playsInline
          preload="auto"
          onEnded={() => dispatch(flashEnded())}
        >
          {isSafari ? (
            <source src={catBoom.flash.mov} type='video/mp4; codecs="hvc1"' />
          ) : (
            <source src={catBoom.flash.webm} type="video/webm" />
          )}
        </video>
      )}
    </div>
  );
};
