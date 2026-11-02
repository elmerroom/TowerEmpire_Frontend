import { Navigate } from 'react-router-dom';
import { FootprintLoader } from '../../components/helpers/loader/cat_footprints';

export const ProtectedRoute = ({
  children,
  redirectPath = '/',
  canAccess,
  isReAuthLoading,
}) => {
  if (isReAuthLoading) return <FootprintLoader />;
  if (!canAccess) {
    console.log('Redirecting because access is denied');
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};
