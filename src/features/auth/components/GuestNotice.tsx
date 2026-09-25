import { useNavigate } from 'react-router-dom';
import { ArcadeButton } from '@/shared/components/ArcadeButton';
import { ArcadeCard } from '@/shared/components/ArcadeCard';
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
    <ArcadeCard
      glow={false}
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
    >
      <section aria-label="Guest run" className="text-sm leading-relaxed">
        <h2 className="text-accent">{title}</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Guest progress isn't saved or ranked. Sign up to keep your level from
          the next run on.
        </p>
      </section>
      <ArcadeButton variant="secondary" size="sm" className="shrink-0" onClick={() => navigate('/signup')}>
        SIGN UP
      </ArcadeButton>
    </ArcadeCard>
  );
};
