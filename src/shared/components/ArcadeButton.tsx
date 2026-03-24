import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/utils';

interface ArcadeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const ArcadeButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  type = 'button',
}: ArcadeButtonProps) => {
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border-border',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border-border',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90 border-border',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-border',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-pixel border-3 transition-all duration-150',
        'active:translate-y-1 active:shadow-none active:brightness-75',
        'shadow-[0_4px_0_0_hsl(var(--border))]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </Button>
  );
};
