import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';

interface GuestNoticeProps {
  /** What the guest just did, shown as the heading. */
  title: string;
  className?: string;
}

/** Tells a guest their progress isn't kept, with the way to keep it. */
export const GuestNotice = ({ title, className }: GuestNoticeProps) => {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Guest run"
      className={cn(
        'rpg-window flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="text-xs leading-relaxed">
        <h2 className="text-bone">{title}</h2>
        <p className="mt-2 text-bone-dim">
          Guest progress isn't saved or ranked. Create an account to keep your
          level from the next run on.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/signup')}
        className="shrink-0 bg-torch px-4 py-3 text-xs text-plum-950 hover:bg-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-torch"
      >
        CREATE ACCOUNT
      </button>
    </section>
  );
};
