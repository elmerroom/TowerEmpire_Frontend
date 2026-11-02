import { Leader } from './leader/leader';
import { Time } from './time/time';
import { Round } from './round/round';
import { TimeLine } from './timeLine/timeLine';
import { GameTimerProvider } from '../../entities/game/model/GameTimerContext';
import { CatTimerWatcher } from '../../features/animation/ui/CatAnimationController';

export const ProgressBar = () => {
  const className = 'status-bar';
  return (
    <GameTimerProvider>
      <CatTimerWatcher />
      <div className={className}>
        <Leader className={className} />
        <Time className={className} />
        <Round className={className} />
        <TimeLine ClassName={className} />
      </div>
    </GameTimerProvider>
  );
};
