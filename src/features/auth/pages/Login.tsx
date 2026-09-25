import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SignIn, SignUp, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { TitleVignette } from '@/features/auth/components/TitleVignette';
import { ArcadeButton } from '@/shared/components/ArcadeButton';
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

  const onPlay = user?.isGuest ? () => navigate('/') : () => void playAsGuest();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-10 pb-28 lg:px-12 lg:py-16">
      {/*
        Desktop: the way in on the left (logo, PLAY NOW, accounts), the demo on
        the right spanning the same height. Phones stack logo, PLAY NOW, demo,
        then accounts, so the main action sits above the fold.
      */}
      <div className="w-full max-w-[34rem] lg:max-w-[76rem] grid gap-8 lg:grid-cols-[24rem_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-20">
        <header className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-start-1 lg:row-start-1">
          <h1 className="w-full flex justify-center lg:justify-start">
            <img
              src="/resources/images/login.png"
              alt="ByteBound"
              className="w-[min(100%,18rem)] sm:w-[20rem] lg:w-full"
            />
          </h1>
          <p className="mt-5 text-sm text-muted-foreground">LEVEL UP YOUR SKILLS</p>
        </header>

        {panel === 'menu' ? (
          <>
            <section aria-label="Play" className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2">
              <ArcadeButton
                variant="primary"
                size="lg"
                className="w-full py-5 text-lg lg:text-xl"
                disabled={isBusy}
                onClick={onPlay}
              >
                <span aria-live="polite" className={isBusy ? 'animate-blink motion-reduce:animate-none' : undefined}>
                  {playLabel}
                </span>
              </ArcadeButton>
              <p className="text-xs leading-relaxed text-muted-foreground text-balance">
                {user?.isGuest
                  ? 'Pick up where you left off.'
                  : "No account needed. Guest runs aren't saved or ranked."}
              </p>
              {error && (
                <p role="alert" className="text-xs leading-relaxed text-destructive">
                  {error}
                </p>
              )}
              <ServerStatusLine />
            </section>

            <div className="lg:col-start-2 lg:row-start-1 lg:row-span-3">
              <TitleVignette />
            </div>

            <section
              aria-label="Account"
              className="flex flex-col gap-4 pt-5 border-t-2 border-border lg:col-start-1 lg:row-start-3 lg:self-end"
            >
              <p className="text-xs leading-relaxed text-muted-foreground text-balance">Keep your level and get ranked:</p>
              <div className="grid grid-cols-2 gap-4">
                <ArcadeButton variant="secondary" size="sm" className="w-full" disabled={isBusy} onClick={() => openPanel('sign-in')}>
                  SIGN IN
                </ArcadeButton>
                <ArcadeButton variant="secondary" size="sm" className="w-full" disabled={isBusy} onClick={() => openPanel('sign-up')}>
                  SIGN UP
                </ArcadeButton>
              </div>
            </section>
          </>
        ) : (
          <>
            <section
              aria-label={panel === 'sign-up' ? 'Sign up' : 'Sign in'}
              className="flex flex-col items-start gap-5 lg:col-start-1 lg:row-start-2 lg:row-span-2"
            >
              <ArcadeButton variant="secondary" size="sm" onClick={backToMenu}>
                BACK
              </ArcadeButton>
              {panel === 'sign-up' ? (
                <SignUp routing="hash" signInUrl="/login" forceRedirectUrl="/" signInForceRedirectUrl="/" />
              ) : (
                <SignIn routing="hash" signUpUrl="/signup" forceRedirectUrl="/" signUpForceRedirectUrl="/" />
              )}
              <ServerStatusLine />
            </section>

            <div className="lg:col-start-2 lg:row-start-1 lg:row-span-3">
              <TitleVignette />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Login;
