import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './achievement-progress-bar.module.scss';

interface AchievementProgressBarProps {
  title: string;
  description: string;
  current: number;
  target: number;
  date?: string;
}

export const AchievementProgressBar = ({
  title,
  description,
  current,
  target,
  date,
}: AchievementProgressBarProps) => {
  const [progress, setProgress] = useState(0);
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const isComplete = percentage >= 100;

  const medalMapping: Record<string, string> = {
    Новичок: 'copper',
    Любитель: 'silver',
    Бывалый: 'gold',
    Эксперт: 'diamond',
  };

  const medalColor = medalMapping[title] || 'copper';

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <motion.li
      className={`personal-profile__achievements-list__icon${isComplete ? 'complete' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="icon-medal">
        <svg
          width="90"
          height="90"
          style={{
            opacity: isComplete ? 1 : 0.3,
            transition: 'opacity 0.3s ease',
          }}
        >
          <use href={`#profile-achievement-${medalColor}`}></use>
        </svg>
      </div>
      <div
        className={`${styles['personal-profile__achievements-list__progressbar']} ${isComplete ? 'personal-profile__achievements-list__progressbar--complete' : ''}`}
      >
        <div
          className={
            isComplete
              ? 'personal-profile__achievements-list__progressbar-title--complete'
              : 'personal-profile__achievements-list__progressbar-title'
          }
        >
          {title}
          <div className="personal-profile__achievements-list__progressbar-info">
            {description}
          </div>
        </div>

        <motion.div
          className={`${styles['progress-fill']} ${isComplete ? styles['progress-fill--complete'] : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          style={{ height: '100%' }}
        />
        <div className={styles['achievement-info']}>
          {isComplete ? (
            <>
              <div className={styles['achievement-info__wrapper']}>
                <svg
                  width="19"
                  height="15"
                  viewBox="0 0 19 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.0253 0.501805C16.351 0.181518 16.7908 0.00126181 17.2494 6.59939e-06C17.7081 -0.00124861 18.1489 0.176598 18.4764 0.495098C18.8039 0.813597 18.9919 1.24716 18.9997 1.70205C19.0076 2.15693 18.8346 2.5966 18.5182 2.92598L9.22616 14.4466C9.06646 14.6172 8.87372 14.7541 8.65945 14.8491C8.44518 14.9442 8.21379 14.9954 7.97912 14.9997C7.74445 15.004 7.5113 14.9613 7.29364 14.8742C7.07597 14.7871 6.87825 14.6574 6.71229 14.4928L0.555632 8.38384C0.384114 8.22531 0.246544 8.03415 0.151129 7.82175C0.0557137 7.60935 0.00440743 7.38006 0.000271684 7.14756C-0.00386406 6.91506 0.0392555 6.68412 0.127057 6.46851C0.214859 6.2529 0.345544 6.05705 0.511317 5.89262C0.67709 5.7282 0.874554 5.59857 1.09193 5.51148C1.30931 5.4244 1.54214 5.38163 1.77654 5.38573C2.01094 5.38983 2.24211 5.44072 2.45625 5.53536C2.6704 5.63 2.86313 5.76645 3.02295 5.93657L7.89707 10.7688L15.981 0.552598C15.9955 0.534714 16.0087 0.517749 16.0253 0.501805Z"
                    fill="white"
                  />
                </svg>
                <span className="achievement-status">Получено</span>
              </div>

              <span className="achievement-date">{date}</span>
            </>
          ) : (
            <span
              className={
                styles[
                  'personal-profile__achievements-list__progressbar-metric'
                ]
              }
            >
              {current}/{target}
            </span>
          )}
        </div>
      </div>
    </motion.li>
  );
};
