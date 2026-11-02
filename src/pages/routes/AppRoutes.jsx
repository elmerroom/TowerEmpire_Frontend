import { Fufl } from '@/fuflomicin/ui/fuflomicinGame/Fufl';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuthFlow } from '../../features/auth/model/use-auth-flow';
import { FootprintLoader } from '../../components/helpers/loader/cat_footprints';
import { Lobby } from '../../components/lobby/lobby';
import { ChooseGame } from '../choose_game';
import { EvilCards } from '../evil_cards';
import { InvitePage } from '../invite';
import { NotFound } from '../not-found/not-found';
import { ProtectedRoute } from './protected_route';
import { WebSocketLayout } from './WebSocketLayout';
import { ProfilePage } from '../profile/ui/profile-page';
// import { useGetVersionQuery } from '../../store/lobbyApi';
import { MainPage } from '../MainPage'; // ← новый импорт
import { EmailConfirmedPage } from '../EmailConfirmedPage';
import { PrivacyPolicyPage } from '../privacy-policy';
import { PersonalDataPolicyPage } from '../personal-data-policy';
import { HireForFun } from '@/fuflomicin/ui/hireForFunGame/HireForFun';
import { DragonsLayout, SimpleLayout } from '@/shared/ui/layouts';

export const AppRoutes = () => {
  const { isAuth, reAuth, isReAuthLoading, isGuest } = useAuthFlow();
  const [isInitialized, setIsInitialized] = useState(false);

  /*   const [version, setVersion] = useState('...');
  const frontendVersion = '012';
  const gameVersion = '1';

  const { data, error } = useGetVersionQuery();

  useEffect(() => {
    if (data && data.version) {
      const backendVersion = data.version;
      setVersion(`${gameVersion}.${frontendVersion}.${backendVersion}`);
    } else if (error) {
      console.error('Ошибка при получении версии:', error);
      setVersion(`${gameVersion}?.?.${frontendVersion}`);
    }
  }, [data, error]); */

  // Выполняем reAuth и ждем его завершения
  useEffect(() => {
    const initializeAuth = async () => {
      await reAuth();
      setIsInitialized(true);
    };
    initializeAuth();
  }, [reAuth]);

  if (!isInitialized) return <FootprintLoader />;

  return (
    <>
      <Routes>
        <Route element={<SimpleLayout />}>
          <Route path="/fufl" element={<Fufl />} />
          <Route path="/hire-for-fun" element={<HireForFun />} />
          <Route path="/" element={<MainPage />} />{' '}
          {/* ← лендинг по умолчанию */}
          <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route
            path="/personal-data-policy"
            element={<PersonalDataPolicyPage />}
          />
        </Route>

        <Route element={<DragonsLayout />}>
          <Route path="/lobby" element={<Lobby />} /> {/* ← список комнат */}
          <Route
            path="/invite/:id"
            element={
              <ProtectedRoute
                canAccess={true}
                isReAuthLoading={isReAuthLoading}
                redirectPath="/not-found"
              >
                <InvitePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                canAccess={isAuth && !isGuest}
                isReAuthLoading={isReAuthLoading}
              >
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="not-found" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Добавляем защищенный маршрут для приглашений */}

        <Route
          path="lobby/:id/*"
          element={
            <ProtectedRoute
              canAccess={isAuth}
              isReAuthLoading={isReAuthLoading}
            >
              <WebSocketLayout />
            </ProtectedRoute>
          }
        >
          <Route element={<DragonsLayout />}>
            <Route index element={<ChooseGame />} />
            <Route path="evil-cards" element={<EvilCards />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route element={<SimpleLayout />}>
            <Route path="fuflomicin" element={<Fufl />} />
            <Route path="hire-for-fun" element={<HireForFun />} />
          </Route>
        </Route>
      </Routes>
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          fontSize: '12px',
          color: '#666',
          zIndex: 100,
        }}
      >
        {/*  v.{version} */}
      </div>
    </>
  );
};
