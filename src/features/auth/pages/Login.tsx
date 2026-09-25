import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SignIn, SignUp, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { TitleVignette } from '@/features/auth/components/TitleVignette';
import { ArcadeButton } from '@/shared/components/ArcadeButton';
import { ArcadeCard } from '@/shared/components/ArcadeCard';
import { ServerStatusLine } from '@/shared/components/ServerStatusLine';
import { startGuestSession } from '@/shared/services/guestSession';
import { getPlayerByUid, playerQueryKeys } from '@/shared/services/playerService';
import { waitForServer } from '@/shared/services/serverStatus';

interface LoginProps {
  mode?: 'sign-in' | 'sign-up';
}

type Panel = 'menu' | 'sign-in' | 'sign-up';
type Starting = 'idle' | 'waking' | 'entering';

/** The only category so far; guests go straight into it. */
const GUEST_GAME_URL = '/game?category=dsa&mode=endless';

const Login = ({ mode = 'sign-in' }: LoginProps) => {
  const { user, isLoading } = useAuth();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Clerk keeps its multi-step flows in the hash (e.g. #/factor-one), so a
  // hash means a sign-in is already under way.
  const [panel, setPanel] = useState<Panel>(
    mode === 'sign-up' ? 'sign-up' : location.hash.length > 1 ? 'sign-in' : 'menu',
  );
  const [starting, setStarting] = useState<Starting>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!isLoading && clerkUser) {
    return <Navigate to="/" replace />;
  }

  const playAsGuest = async () => {
    if (starting !== 'idle') return;
    setError(null);

    setStarting('waking');
    const awake = await waitForServer();
    if (!awake) {
      setStarting('idle');
      setError("The server didn't wake up. Give it a moment and try again.");
      return;
    }

    setStarting('entering');
    try {
      const session = await startGuestSession();
      // Load the player before the game screen needs it
      await queryClient.fetchQuery({
        queryKey: playerQueryKeys.byUid(session.playerId),
        queryFn: () => getPlayerByUid(),
      });
      navigate(GUEST_GAME_URL);
    } catch (err) {
      setStarting('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong starting a guest run.');
    }
  };

  const openPanel = (next: Panel) => {
    setError(null);
    if (next === 'sign-up') {
      navigate('/signup');
    } else if (mode === 'sign-up') {
      navigate('/login');
    }
    setPanel(next);
  };

  const backToMenu = () => {
    if (mode === 'sign-up' || location.hash) {
      navigate('/login', { replace: true });
    }
    setPanel('menu');
  };

  const isBusy = starting !== 'idle';
  const playLabel = user?.isGuest
    ? `CONTINUE AS ${user.username.toUpperCase()}`
    : starting === 'waking'
      ? 'WAKING THE SERVER...'
      : starting === 'entering'
        ? 'ENTERING THE CAVE...'
        : error
          ? 'TRY AGAIN'
          : 'PLAY NOW';

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-10 pb-24 lg:px-8">
      <div className="w-full max-w-[34rem] lg:max-w-[72rem] grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16 lg:items-center">
        {/* Left: title and the ways in */}
        <div className="w-full flex flex-col items-center">
          <h1 className="w-full flex justify-center">
            <img
              src="/resources/images/login.png"
              alt="ByteBound"
              className="w-[min(100%,20rem)]"
            />
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">LEVEL UP YOUR SKILLS</p>

          {panel === 'menu' ? (
            <div className="mt-8 w-full flex flex-col gap-6">
              <ArcadeCard className="flex flex-col gap-4">
                <ArcadeButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isBusy}
                  onClick={user?.isGuest ? () => navigate('/') : () => void playAsGuest()}
                >
                  <span aria-live="polite" className={isBusy ? 'animate-blink motion-reduce:animate-none' : undefined}>
                    {playLabel}
                  </span>
                </ArcadeButton>
                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  {user?.isGuest
                    ? 'Pick up where you left off.'
                    : "No account needed. Guest runs aren't saved or ranked."}
                </p>

                {error && (
                  <p role="alert" className="text-center text-xs leading-relaxed text-destructive">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-border">
                  <ArcadeButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={isBusy}
                    onClick={() => openPanel('sign-in')}
                  >
                    SIGN IN
                  </ArcadeButton>
                  <ArcadeButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={isBusy}
                    onClick={() => openPanel('sign-up')}
                  >
                    SIGN UP
                  </ArcadeButton>
                </div>
              </ArcadeCard>

              <ServerStatusLine />
            </div>
          ) : (
            <div className="mt-8 w-full flex flex-col items-center gap-5">
              <ArcadeButton variant="secondary" size="sm" className="self-start" onClick={backToMenu}>
                BACK
              </ArcadeButton>

              {panel === 'sign-up' ? (
                <SignUp
                  routing="hash"
                  signInUrl="/login"
                  forceRedirectUrl="/"
                  signInForceRedirectUrl="/"
                />
              ) : (
                <SignIn
                  routing="hash"
                  signUpUrl="/signup"
                  forceRedirectUrl="/"
                  signUpForceRedirectUrl="/"
                />
              )}

              <ServerStatusLine />
            </div>
          )}
        </div>

        {/* Right: the gameplay loop, shown before anyone commits */}
        <TitleVignette />
      </div>
    </main>
  );
};

export default Login;
