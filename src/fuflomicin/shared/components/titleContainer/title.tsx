import { Leader } from '../Leader/Leader';
import styles from './title.module.scss';

interface TitleProps {
  gameName?: string;
  leaderNameColor?: string;
}

export const Title = ({
  gameName = 'ФУФЛОМИЦИН',
  leaderNameColor,
}: TitleProps) => {
  return (
    <div className={styles.titleContainer}>
      <div className={styles.titleBlock}>
        <svg className={styles.towerSVG}>
          <use href="#tower-fufl"></use>
        </svg>
        <h2 className={styles.title}>{gameName}</h2>
      </div>
      <img
        className={styles.catSVG}
        src="/img/fufl_cat.svg"
        alt="Аватар Покупателя"
      />

      <Leader nameColor={leaderNameColor} />
    </div>
  );
};
