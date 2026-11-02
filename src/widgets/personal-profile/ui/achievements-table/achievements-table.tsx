import { motion } from 'framer-motion';
import { useState, useEffect, useRef, forwardRef } from 'react';
import { PlayerStat, UserAchievement } from '@/entities/user/api/user-api';
import { AchievementProgressBar } from '../achievement-progress-bar/achievement-progress-bar';

interface AchievementsTableProps {
  statistics: PlayerStat[];
  achievements: UserAchievement[];
}

export const AchievementsTable = forwardRef<
  HTMLDivElement,
  AchievementsTableProps
>(({ statistics, achievements }, ref) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleToggle = (index: number) => {
    setActiveIndex(prevIndex => (prevIndex === index ? null : index));
  };

  useEffect(() => {
    if (activeIndex !== null && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeIndex]);

  const getAchievementIcon = (totalGames: number) => {
    const iconClass = totalGames < 10 ? 'opacity' : '';
    let medal = 'copper';

    if (totalGames >= 300) medal = 'diamond';
    else if (totalGames >= 100) medal = 'gold';
    else if (totalGames >= 50) medal = 'silver';
    else if (totalGames >= 10) medal = 'copper';
    else medal = 'copper';

    return (
      <svg className={iconClass} width="57" height="57">
        <use href={`#profile-achievement-${medal}`}></use>
      </svg>
    );
  };

  const getAchievementDate = (title: string, gameName: string) => {
    return achievements.find(
      a => a.achievement.name === title && a.game_name === gameName,
    )?.receiving_cond;
  };

  if (!statistics?.length) {
    return (
      <div className="no-stats-placeholder">
        <p>Вы еще не сыграли ни одной игры.</p>
      </div>
    );
  }

  return (
    <div ref={ref}>
      <section className="personal-profile__table-container">
        <table className="table-lobby personal-profile__table">
          <thead className="personal-profile__thead">
            <tr>
              <th scope="col">
                <span>Название игры</span>
              </th>
              <th scope="col">Сыграно</th>
              <th scope="col">Побед</th>
              <th scope="col">Достижение</th>
              <th scope="col">
                <span>Детали</span>
              </th>
            </tr>
          </thead>

          <tbody className="personal-profile__tbody--active">
            {statistics.map((stat, index) => (
              <tr key={index}>
                <td scope="row" className="text-color-blue">
                  <span>{stat.game_name}</span>
                </td>
                <td>{stat.total_game}</td>
                <td className="table-lobby__name ">{stat.won_game}</td>
                <td className="personal-profile__tbody-achivement">
                  {getAchievementIcon(stat.total_game)}
                </td>
                <td className="personal-profile__details">
                  <motion.svg
                    animate={{ rotate: activeIndex === index ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ cursor: 'pointer' }}
                    width="25"
                    height="20"
                    onClick={() => handleToggle(index)}
                  >
                    <use href="#profile-details"></use>
                  </motion.svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="personal-profile__table-stripe"></div>
      </section>

      {activeIndex !== null && statistics[activeIndex] && (
        <motion.div
          className="personal-profile__achievements-details"
          ref={detailsRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <section className="personal-profile__achievements">
            <h6 className="personal-profile__achievements-title">
              досТИЖенИя {statistics[activeIndex].game_name}:
            </h6>
            <ul className="personal-profile__achievements-list">
              {(() => {
                const currentStat = statistics[activeIndex as number];
                if (!currentStat) return null;
                return [
                  { title: 'Эксперт', desc: 'Сыграть 300 игр', target: 300 },
                  { title: 'Бывалый', desc: 'Сыграть 100 игр', target: 100 },
                  { title: 'Любитель', desc: 'Сыграть 50 игр', target: 50 },
                  { title: 'Новичок', desc: 'Сыграть 10 игр', target: 10 },
                ].map(ach => (
                  <AchievementProgressBar
                    key={ach.title}
                    title={ach.title}
                    description={ach.desc}
                    current={currentStat.total_game}
                    target={ach.target}
                    date={
                      getAchievementDate(ach.title, currentStat.game_name) ||
                      undefined
                    }
                  />
                ));
              })()}
            </ul>
          </section>
        </motion.div>
      )}
    </div>
  );
});

AchievementsTable.displayName = 'AchievementsTable';
