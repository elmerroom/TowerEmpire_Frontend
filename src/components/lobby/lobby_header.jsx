import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useCallback } from 'react';
import {
  setAuth,
  getIsGuest,
  clearUser,
} from '../../entities/user/model/slice';
import { openModal } from '../../store/modalSlice';
import { ModalAboutUs } from '../../features/aboutUs/ui/ModalAboutUs';
import { useLazyGetPersonalAreaQuery } from '../../entities/user/api/user-api';
import { AvatarLetter } from '../helpers/help_functions';
import { Button } from '../../shared/ui/Button';
import { RegisterBanner } from '../../features/registerBanner/ui/RegisterBanner';

export const LoginHeader = () => {
  const [isOpen, setOpen] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(state => state.user.isAuth);
  const isGuest = useSelector(getIsGuest);
  const token = useSelector(state => state.user.accessToken);
  const { username, avatar, nickname_color } = useSelector(state => state.user);
  const email = useSelector(state => state.user.email);
  const menuRef = useRef(null);
  const [getPersonalArea] = useLazyGetPersonalAreaQuery();
  const isRealUser = isAuth && (username || email);

  useEffect(() => {
    setOpen(false);
  }, [isAuth]);

  const handleLogout = () => {
    dispatch(clearUser());
    dispatch(setAuth(false));
  };

  useEffect(() => {
    if (!isGuest && token) {
      getPersonalArea();
    }
  }, [isGuest, token, getPersonalArea]);

  const handleOpen = () => {
    setOpen(prev => !prev);
  };

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleLogoClick = () => {
    navigate('/');
  };

  useOutsideClick(menuRef, handleClose);

  return (
    <div className="login-header">
      <div className="login-header_left">
        <div className="lobby__logo" onClick={handleLogoClick}>
          <img
            src="/img/LogoTowerEmpire.svg"
            alt="Tower Empire"
            className="lobby__logo-img"
          />
        </div>
        <div className="lobby__commercial">
          <a
            href="https://discord.gg/bYjdJsK5ZH"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="lobby__btn-discord" />
          </a>
        </div>
        {isGuest && <RegisterBanner />}
        <div className="login-header-aboutUs_wrapper">
          <div className="text-color-blue" onClick={setShowAboutUs}>
            <span>О нас</span>
            <svg style={{ height: '18px', width: '15px' }}>
              <use href="#i-tower"></use>
            </svg>
          </div>
        </div>
      </div>

      {isRealUser ? (
        <div className="login-header_right">
          <div
            className="login-header_wrapper__auth"
            id="#openclicker"
            onClick={handleOpen}
          >
            <div
              className="card-player__avatar"
              style={
                avatar
                  ? { backgroundImage: `url(${avatar})` }
                  : { color: nickname_color || '#4eb5b5' }
              }
            >
              {!avatar && AvatarLetter(username || email)}
            </div>
            <div
              className="card-player__nickname"
              style={{ color: `${nickname_color || '#4eb5b5'}` }}
            >
              {username || email}
            </div>
            {isOpen ? (
              <FontAwesomeIcon icon={faCaretUp} />
            ) : (
              <FontAwesomeIcon icon={faCaretDown} />
            )}
          </div>
          <div
            className={`login-header_wrapper__modal ${isOpen && 'open'}`}
            ref={menuRef}
          >
            {isGuest ? (
              <>
                <div
                  onClick={() => {
                    handleLogout();
                    dispatch(openModal('authmodal'));
                    setOpen(false);
                  }}
                >
                  Регистрация
                </div>
                <hr></hr>
              </>
            ) : (
              <>
                <div onClick={() => navigate('/profile')}>Личный кабинет</div>
                <hr></hr>
              </>
            )}
            <div onClick={handleLogout}>Выход</div>
            <hr></hr>
          </div>
        </div>
      ) : (
        <div className="login-header_wrapper">
          <div className="text-color-blue">
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
      !e.target.classList.contains('text-color-blue') &&
      !e.target.classList.contains('card-player__nickname') &&
      !e.target.closest('svg') &&
      !e.target.closest('path')
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
