import { Navigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/react';
import { useAuth } from '@/features/auth/contexts/AuthContext';

interface LoginProps {
  mode?: 'sign-in' | 'sign-up';
}

const Login = ({ mode = 'sign-in' }: LoginProps) => {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <img src="/resources/images/login.png" alt="ByteBound" />
          <p className="text-lg text-muted-foreground">LEVEL UP YOUR SKILLS</p>
        </div>

        {mode === 'sign-in' ? (
          <SignIn
            routing="hash"
            signUpUrl="/signup"
            forceRedirectUrl="/"
            signUpForceRedirectUrl="/"
          />
        ) : (
          <SignUp
            routing="hash"
            signInUrl="/login"
            forceRedirectUrl="/"
            signInForceRedirectUrl="/"
          />
        )}
      </div>
    </div>
  );
};

export default Login;
