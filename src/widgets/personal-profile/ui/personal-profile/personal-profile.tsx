import { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useDispatch } from 'react-redux';
import { openModal } from '@/store/modalSlice';
import { PersonalProfileHeader } from '../profile-header/profile-header';
import {
  PersonalProfileProgressBar,
  rankLevels,
  getRankInfo,
} from '@/features/personalProfileProgressBar';
import { FootprintLoader } from '@/components/helpers/loader/cat_footprints';
import { UserProfile } from '@/entities/user/api/user-api';
import { AvatarUpload } from '@/features/profile-settings/ui/avatar-upload/avatar-upload';
import { AchievementsTable } from '../achievements-table/achievements-table';
import { Button } from '@/shared/ui/Button';

interface PersonalProfileProps {
  profile: UserProfile;
}

export const PersonalProfileWidget = ({ profile }: PersonalProfileProps) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(0);

  const {
    currentRank,
    currentSubRank,
    currentRankXp,
    nextRank,
    nextSubRank,
    nextRankXp,
    xpNeededForNext,
  } = getRankInfo(profile.exp, rankLevels);

  // progress for progress bar
  let progress = 0;
  const minXp = currentRankXp;
  const maxXp = nextRankXp ?? profile.exp;

  if (maxXp > minXp) {
    progress = ((profile.exp - minXp) / (maxXp - minXp)) * 100;
    progress = Math.max(0, Math.min(100, progress));
  }

  return (
    <div className="container container_lobby container_lines personal-profile">
      <img
        src="./img/border-decor.svg"
        className="border-decor border-decor_left"
        alt="BorderDecor"
      />
      <img
        src="./img/border-decor.svg"
        className="border-decor border-decor_right"
        alt="BorderDecor"
      />

      <PersonalProfileHeader />

      <h3 className="personal-profile__title">Личный кабинет</h3>

      <section className="personal-profile__information">
        <AvatarUpload currentAvatar={profile.avatar} />

        <div className="personal-profile__right">
          <div className="personal-profile__information-text">
            <h5
              className="personal-profile__information-title"
              style={{ color: profile.nickname_color || '#4eb5b5' }}
            >
              {profile.username}
              <svg
                className="ms-4"
                width="18"
                height="18"
                style={{ cursor: 'pointer' }}
                onClick={() => dispatch(openModal('modalProfileSettings'))}
              >
                <use href="#profile-pencil"></use>
              </svg>
            </h5>
          </div>

          <div className="personal-profile__information-level">
            <h5>
              {currentRank} {currentSubRank}
            </h5>
            <div>
              <PersonalProfileProgressBar completed={progress} />
              <div className="personal-profile__information-level_xp">
                <span>
                  {nextRankXp
                    ? `XP: ${profile.exp}/${nextRankXp}`
                    : `XP: ${profile.exp} (макс)`}
                </span>
                <div className="personal-profile__information__modal-info_helper">
                  <svg width="20" height="20">
                    <use href="#profile-rang-circle"></use>
                  </svg>
                  <div className="personal-profile__information__modal-info_helper-modal">
                    {nextRankXp ? (
                      <p>
                        Необходимо ещё {xpNeededForNext} ХР
                        <br />
                        для получения ранга:
                        <br />
                        {nextRank} {nextSubRank}
                      </p>
                    ) : (
                      <p>Вы уже достигли максимального ранга</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="personal-profile__separator">
        <svg width="100%" height="21">
          <use href="#profile-separator"></use>
        </svg>
      </div>

      <div className="mb-4 justify-content-between ">
        <Tabs selectedIndex={selectedTab} onSelect={setSelectedTab}>
          <TabList className="personal-profile__tabs-section">
            <div style={{ display: 'flex' }}>
              <Tab>
                <Button
                  className={`personal-profile__button ${selectedTab === 0 ? 'active' : ''}`}
                >
                  Статистика
                </Button>
              </Tab>
              <Tab>
                <Button
                  className={`personal-profile__button ${selectedTab === 1 ? 'active' : ''}`}
                >
                  Магазин
                </Button>
              </Tab>
              <div className="personal-profile__tabs-stripe"></div>
            </div>
          </TabList>

          <TabPanel>
            <AchievementsTable
              statistics={profile.statistics}
              achievements={profile.achievements}
            />
          </TabPanel>
          <TabPanel>
            <div className="p-4 text-center text-color-blue">
              Магазин временно недоступен
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};
