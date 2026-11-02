import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Choose_header.module.scss';
import { ModalAboutUs } from '../../../../features/aboutUs/ui/ModalAboutUs';
import { openModal } from '../../../../store/modalSlice';
import { Button } from '../../../../shared/ui/Button';
import { getIsGuest } from '../../../../entities/user/model/slice';
import { RegisterBanner } from '@/features/registerBanner/ui/RegisterBanner';

export const Header = () => {
  const [showAboutUs, setShowAboutUs] = useState(false);
  const dispatch = useDispatch();
  const isGuest = useSelector(getIsGuest);
  return (
    <div className={styles.chooseHeader}>
      <Button
        className={styles.btnBack}
        onClick={() => dispatch(openModal('modalGameExit'))}
      >
        <svg width="16" height="22">
          <use href="#profile-arrow-back"></use>
        </svg>
        <p> Выйти </p>
      </Button>

      {isGuest && <RegisterBanner />}

      <div className={styles.chooseHeader__right}>
        <div className="login-header-aboutUs_wrapper">
          <div className="text-color-blue" onClick={setShowAboutUs}>
            <span>О нас</span>
            <svg style={{ height: '18px', width: '15px' }}>
              <use href="#i-tower"></use>
            </svg>
          </div>
        </div>

        <div className={styles.commercialChoose}>
          {/* <div className="commercial commercial_chose"> */}
          <div>
            <a
              href="https://discord.gg/bYjdJsK5ZH"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="commercial__btn-discord" />
            </a>
          </div>
        </div>
      </div>

      <ModalAboutUs
        isOpen={showAboutUs}
        onClose={() => setShowAboutUs(false)}
      />
    </div>
  );
};
