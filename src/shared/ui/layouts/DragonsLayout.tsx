import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import { useSelector } from 'react-redux';
import { DragonsParallaxController, DragonSide } from '../icons';
import type { RootState } from '@/store/store';

export const DragonsLayout: React.FC = () => {
  const scrollableNodeRef = useRef(null);
  const wrapperRef = useRef(null);
  const game = useSelector((state: RootState) => state.modal.gameMode);
  const wrapperClass = `${game ? 'wrapper_game' : 'wrapper'}`;

  return (
    <SimpleBar
      className="main-scrollbar"
      style={{ height: '100vh' }}
      scrollableNodeProps={{ ref: scrollableNodeRef }}
    >
      <div className={`${wrapperClass} wrapper--with-dragons`} ref={wrapperRef}>
        <DragonsParallaxController
          scrollElementRef={scrollableNodeRef}
          targetElementRef={wrapperRef}
        />
        <DragonSide side="left" />
        <div className="wrapper__content">
          <Outlet />
        </div>
        <DragonSide side="right" />
      </div>
    </SimpleBar>
  );
};
