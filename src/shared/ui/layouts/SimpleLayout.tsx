import { Outlet } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import 'simplebar-react/dist/simplebar.min.css';
import type { RootState } from '@/store/store';

export const SimpleLayout: React.FC = () => {
  const game = useSelector((state: RootState) => state.modal.gameMode);
  const location = useLocation();
  const isMain = location.pathname === '/';
  const isPolicy =
    location.pathname === '/privacy-policy' || '/personal-data-policy';
  const wrapperClass = `${game ? 'wrapper_game wrapper--theme-fufl' : 'wrapper'} ${
    isMain || isPolicy ? 'wrapper--no-grid' : ''
  }`;

  return (
    <SimpleBar
      className={`main-scrollbar${game ? ' main-scrollbar--game' : ''}`}
      style={{ height: '100vh' }}
    >
      <div className={`${wrapperClass}`}>
        <div className="wrapper__content">
          <Outlet />
        </div>
      </div>
    </SimpleBar>
  );
};
