import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import Dashboard from './Dashboard';
import { LoadingScreen } from '@/shared/components/LoadingScreen';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return <Dashboard />;
};

export default Index;
