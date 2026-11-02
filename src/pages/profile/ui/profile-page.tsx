import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetPersonalAreaQuery } from '@/entities/user/api/user-api';
import { setUser } from '@/entities/user/model/slice';
import { FootprintLoader } from '@/components/helpers/loader/cat_footprints';
import { PersonalProfileWidget } from '@/widgets/personal-profile/ui/personal-profile/personal-profile';
import { ProfileSettingsModal } from '@/features/profile-settings/ui/profile-settings-modal/profile-settings-modal';
import { Button } from '@/shared/ui/Button';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useGetPersonalAreaQuery();

  useEffect(() => {
    if (profile) {
      // Sync core user state with fetched profile
      dispatch(
        setUser({
          user_id: profile.id,
          username: profile.username,
          email: profile.email,
          date_joined: profile.date_joined,
          avatar: profile.avatar,
          nickname_color: profile.nickname_color,
          is_vip: profile.is_vip,
          achievements: profile.achievements,
          statistics: profile.statistics,
        }),
      );
    }
  }, [profile, dispatch]);

  if (isLoading) {
    return <FootprintLoader />;
  }

  if (isError || !profile) {
    return (
      <div className="container p-5 text-center">
        <h3 className="text-danger">Ошибка загрузки профиля</h3>
        <Button
          variant="submit"
          style={{ marginTop: '1rem' }}
          onClick={() => refetch()}
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <>
      <PersonalProfileWidget profile={profile} />
      <ProfileSettingsModal />
    </>
  );
};

export default ProfilePage;
