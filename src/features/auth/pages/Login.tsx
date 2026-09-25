import { useRef, useState, type KeyboardEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SignIn, SignUp, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { TitleVignette } from '@/features/auth/components/TitleVignette';
import { PixelCursor } from '@/shared/components/PixelCursor';
import { ServerStatusLine } from '@/shared/components/ServerStatusLine';
import { startGuestSession } from '@/shared/services/guestSession';
import { getPlayerByUid, playerQueryKeys } from '@/shared/services/playerService';
import { waitForServer } from '@/shared/services/serverStatus';
import { cn } from '@/shared/lib/utils';

interface LoginProps {
  mode?: 'sign-in' | 'sign-up';
}

type Panel = 'menu' | 'sign-in' | 'sign-up';
type Starting = 'idle' | 'waking' | 'entering';

/** The only category so far; guests go straight into it. */
const GUEST_GAME_URL = '/game?category=dsa&mode=endless';

interface MenuItem {
  id: string;
  label: string;
  hint?: string;
  onSelect: () => void;
}

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
  const [active, setActive] = useState(0);
  const [starting, setStarting] = useState<Starting>('idle');
  const [error, setError] = useState<string | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  const busyLabel = starting === 'waking' ? 'WAKING THE SERVER' : 'ENTERING THE CAVE';

  const items: MenuItem[] = [
    user?.isGuest
      ? {
          id: 'continue',
          label: `CONTINUE AS ${user.username.toUpperCase()}`,
          hint: 'Back to your guest camp.',
          onSelect: () => navigate('/'),
        }
      : {
          id: 'play',
          label: starting === 'idle' ? (error ? 'TRY AGAIN' : 'PLAY NOW') : busyLabel,
          hint: 'No account. Straight into a fight.',
          onSelect: () => void playAsGuest(),
        },
    { id: 'sign-in', label: 'SIGN IN', onSelect: () => openPanel('sign-in') },
    {
      id: 'sign-up',
      label: 'CREATE ACCOUNT',
      hint: 'Keep your level and get on the scoreboard.',
      onSelect: () => openPanel('sign-up'),
    },
  ];

  const moveFocus = (event: KeyboardEvent<HTMLUListElement>) => {
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + items.length) % items.length;
    itemRefs.current[next]?.focus();
  };

  const isBusy = starting !== 'idle';

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-10 pb-24">
      <div className="w-full max-w-[34rem] flex flex-col items-center">
        <h1 className="w-full flex justify-center">
          <img
            src="/resources/images/login.png"
            alt="ByteBound"
            className="w-[min(100%,20rem)] drop-shadow-[0_10px_18px_rgb(0_0_0/0.6)]"
          />
        </h1>
        <p className="mt-4 text-xs text-bone-dim">LEVEL UP YOUR SKILLS</p>

        {panel === 'menu' ? (
          <div className="mt-8 w-full flex flex-col gap-6">
            <TitleVignette />

            <nav aria-label="Start" className="rpg-window px-3 py-3">
              <ul onKeyDown={moveFocus} className="flex flex-col">
                {items.map((item, index) => {
                  const selected = active === index;
                  const disabled = isBusy && item.id !== 'play';
                  return (
                    <li key={item.id}>
                      <button
                        ref={(el) => (itemRefs.current[index] = el)}
                        type="button"
                        autoFocus={index === 0}
                        disabled={disabled}
                        aria-busy={item.id === 'play' && isBusy}
                        onClick={isBusy ? undefined : item.onSelect}
                        onFocus={() => setActive(index)}
                        onMouseEnter={() => setActive(index)}
                        className={cn(
                          'group w-full grid grid-cols-[1.25rem_1fr] gap-x-3 px-3 py-3 text-left outline-none',
                          'disabled:opacity-40 disabled:cursor-not-allowed',
                          selected && 'bg-plum-700/60',
                        )}
                      >
                        <PixelCursor
                          className={cn(
                            'mt-[0.2rem] h-3 w-3 text-torch transition-opacity duration-100',
                            selected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm leading-relaxed',
                            selected ? 'text-torch' : 'text-bone',
                            item.id === 'play' && isBusy && 'animate-blink motion-reduce:animate-none',
                          )}
                        >
                          {item.label}
                        </span>
                        {item.hint && (
                          <span className="col-start-2 mt-1 text-xs leading-relaxed text-bone-dim">
                            {item.hint}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {error && (
                <p role="alert" className="mx-3 mt-2 mb-1 border-t-2 border-plum-700 pt-4 text-xs leading-relaxed text-crimson-bright">
                  {error}
                </p>
              )}
            </nav>

            <ServerStatusLine className="px-1" />

            <p className="px-1 text-xs leading-relaxed text-bone-dim">
              Guest runs aren't saved or ranked.
            </p>
          </div>
        ) : (
          <div className="mt-8 w-full flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={backToMenu}
              className="self-start flex items-center gap-2 text-xs text-bone-dim hover:text-torch focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-torch"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
              BACK
            </button>

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

            <ServerStatusLine className="px-1" />
          </div>
        )}
      </div>
    </main>
  );
};

export default Login;
