import { useSelector } from 'react-redux';
import { getPromptCard } from '@/store/fuflomicin/fuflSlice';
import styles from './Vacancy.module.scss';

export const Vacancy = () => {
  const promptCard = useSelector(getPromptCard);
  const vacancyName = promptCard?.text ?? '...';

  return (
    <div className={styles.vacancy}>
      <svg className={styles.frameSVGLeft}>
        <use href="/sprite.svg#decor-hff-left"></use>
      </svg>
      <h2 className={styles.vacancyLabel}>Вакансия:&nbsp;</h2>
      <h4 className={styles.vacancyName}>{vacancyName}</h4>
      <svg className={styles.frameSVGRight}>
        <use href="/sprite.svg#decor-hff-right"></use>
      </svg>
    </div>
  );
};

Vacancy.displayName = 'Vacancy';
