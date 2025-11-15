import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArcadeButton } from '@/components/ArcadeButton';
import { ArcadeCard } from '@/components/ArcadeCard';
import supabase from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const email = location.state?.email || '';
  const password = location.state?.password || '';

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const checkConfirmation = async () => {
    setIsChecking(true);
    setError(null);

    try {
      // First, check if there's already a session (user clicked email link and browser auto-logged them in)
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        // Session exists, user is confirmed and logged in
        navigate('/', { replace: true });
        return;
      }

      // No session yet - try to log in (this will only work if email is confirmed)
      if (!email || !password) {
        setError('Email or password not found. Please try logging in manually.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Attempt to log in - this will succeed only if email is confirmed
      await login(email, password);
      
      // If login succeeds, redirect to dashboard
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error checking confirmation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to check confirmation status';
      
      // Check if error is related to unconfirmed email
      if (errorMessage.includes('Email not confirmed') || errorMessage.includes('confirm')) {
        setError('Email not confirmed yet. Please check your inbox.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found. Please sign up again.');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        throw error;
      }

      setError(null);
      alert('Confirmation email resent! Please check your inbox.');
    } catch (err) {
      console.error('Error resending email:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend confirmation email');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
    

        <ArcadeCard className="mb-6">
          <div className="space-y-6">
            <div className="text-center">
              
              <h2 className="text-xl text-secondary mb-2">
                CONFIRMATION EMAIL SENT
              </h2>
              {email && (
                <p className="text-sm text-muted-foreground mb-8">
                  Sent to: <span className="text-foreground">{email}</span>
                </p>
              )}
              <p className="text-sm text-foreground">
                Please click the confirmation link in the email to activate your account.
              </p>
            
            </div>

            {error && (
              <div className="p-4 border-2 border-destructive bg-destructive/10 rounded">
                <p className="text-destructive text-sm text-center">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <ArcadeButton
                variant="primary"
                size="lg"
                onClick={checkConfirmation}
                disabled={isChecking}
                className="w-full"
              >
                {isChecking ? 'CHECKING...' : ' I\'VE CONFIRMED'}
              </ArcadeButton>

              <ArcadeButton
                variant="secondary"
                size="lg"
                onClick={handleResendEmail}
                disabled={isChecking || !email}
                className="w-full"
              >
                {isChecking ? 'SENDING...' : 'RESEND EMAIL'}
              </ArcadeButton>
            </div>

            <div className="pt-4 border-t-2 border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Can't find the email? Check your spam folder or click the button above to resend.
              </p>
              <ArcadeButton
                variant="accent"
                size="sm"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                BACK TO LOGIN
              </ArcadeButton>
            </div>
          </div>
        </ArcadeCard>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            After confirming your email, click "I've Confirmed" to continue
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
