import { forwardRef } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/utils';

interface ArcadeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

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

/**
 * The game's chunky pixel button. Takes any button attribute and forwards its
 * ref, so dialogs and other primitives can use it as their trigger.
 */
export const ArcadeButton = forwardRef<HTMLButtonElement, ArcadeButtonProps>(
  ({ children, variant = 'primary', size = 'md', className, type = 'button', ...props }, ref) => (
    <Button
      ref={ref}
      type={type}
      className={cn(
        'font-pixel border-3 transition-all duration-150',
        'active:translate-y-1 active:shadow-none active:brightness-75',
        'shadow-[0_4px_0_0_hsl(var(--border))]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Comfortable thumb targets on touch screens
        '[@media(pointer:coarse)]:min-h-11',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
);
ArcadeButton.displayName = 'ArcadeButton';
