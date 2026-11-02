import { useSelector, useDispatch } from 'react-redux';
import { openModal } from '@/store/modalSlice';
import { setAuth, clearUser } from '@/entities/user/model/slice';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../entities/user/model/hooks';
import { ModalAboutUs } from '../../../../features/aboutUs/ui/ModalAboutUs';
import styles from './profile-header.module.scss';
import { Button } from '@/shared/ui/Button';

export const PersonalProfileHeader = () => {
  const [isOpen, setOpen] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(state => state.user.isAuth);
  const { username, userEmail } = useUser();
  const menuRef = useRef(null);

  const handleLogout = () => {
    dispatch(clearUser());
    dispatch(setAuth(false));
    navigate('/lobby', { replace: true });
  };

  const handleOpen = () => {
    setOpen(prev => !prev);
  };

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useOutsideClick(menuRef, handleClose);

  const handleNavigate = () => {
    navigate('/lobby');
  };

  return (
    <div className={styles.header}>
      <Button className={styles.btnBack} onClick={handleNavigate}>
        <svg width="16" height="22">
          <use href="#profile-arrow-back"></use>
        </svg>
        <p>Назад</p>
      </Button>

      {isAuth ? (
        <div className={styles.headerRight}>
          {/* <div className="login-header_wrapper__auth " id="#openclicker"> */}

          <div className="login-header-aboutUs_wrapper">
            <div className="text-color-blue" onClick={setShowAboutUs}>
              <span data-bs-toggle="modal" data-bs-target="#aboutUsModal">
                О нас
              </span>
              <svg style={{ height: '18px', width: '15px' }}>
                <use href="#i-tower"></use>
              </svg>
            </div>
          </div>

          <div
            className="login-header_wrapper__auth"
            id="#openclicker"
            onClick={handleOpen}
          >
            <div className="personal-profile__header">
              <p className="personal-profile__header__username">
                {username || userEmail} /
              </p>
              <p
                className="personal-profile__header__button-back"
                onClick={handleLogout}
              >
                Выход
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-header_wrapper">
          <div style={{ fontWeight: 600 }} className="text-color-blue">
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => dispatch(openModal('loginmodal'))}
            >
              Вход
            </span>{' '}
            /{' '}
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => dispatch(openModal('authmodal'))}
            >
              Регистрация
            </span>
          </div>
        </div>
      )}
      <ModalAboutUs
        isOpen={showAboutUs}
        onClose={() => setShowAboutUs(false)}
      />
    </div>
  );
};

const useOutsideClick = (ref, callback) => {
  const handleClick = e => {
    if (
      ref.current &&
      !ref.current.contains(e.target) &&
      !e.target.classList.contains('login-header_wrapper__auth') &&
      !e.target.classList.contains('card-player__avatar') &&
      !e.target.classList.contains('text-color-blue')
    ) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, callback]);
};
