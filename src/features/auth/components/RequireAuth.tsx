import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';

/** Renders the nested routes only for signed-in players. */
const RequireAuth = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl text-primary animate-blink">LOADING...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
