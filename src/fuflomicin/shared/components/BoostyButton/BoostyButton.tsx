import { Button } from '@/shared/ui';
import styles from './BoostyButton.module.scss';

export const BoostyButton = () => {
  return (
    <Button
      className={styles.boostyButton}
      onClick={() => window.open('https://boosty.to/towerdragon', '_blank')}
    >
      <svg className={styles.svg}>
        <use href="/sprite.svg#i-boosty-fufl"></use>
      </svg>
    </Button>
  );
};

BoostyButton.displayName = 'BoostyButton';
