import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LoadingScreen } from '@/shared/components/LoadingScreen';

/** Renders the nested routes only for signed-in players. */
const RequireAuth = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
