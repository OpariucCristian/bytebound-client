import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface ArcadeCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const ArcadeCard = ({ children, className, glow = false }: ArcadeCardProps) => {
  return (
    <Card
      className={cn(
        'arcade-border bg-card p-6',
        glow && 'animate-pulse-glow',
        className
      )}
    >
      {children}
    </Card>
  );
};
