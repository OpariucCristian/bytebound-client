import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { cn } from "@/shared/lib/utils";

interface ErrorAction {
  label: string;
  onClick: () => void;
}

interface ErrorPanelProps {
  title: string;
  message: string;
  /** The main way out, usually a retry. */
  action?: ErrorAction;
  /** A way back to safety, e.g. the main menu. */
  secondaryAction?: ErrorAction;
  /** Center on its own screen instead of sitting inside a page. */
  fullScreen?: boolean;
  className?: string;
}

/** Says what went wrong and offers a way forward. */
export const ErrorPanel = ({
  title,
  message,
  action,
  secondaryAction,
  fullScreen = false,
  className,
}: ErrorPanelProps) => {
  const Heading = fullScreen ? "h1" : "h2";
  const panel = (
    <ArcadeCard
      glow={false}
      className={cn("w-full max-w-xl text-center space-y-6", className)}
    >
      <div role="alert" className="space-y-4">
        {/* A full-screen error is the page, so it carries the page heading */}
        <Heading className="text-xl md:text-2xl text-destructive leading-relaxed">
          {title}
        </Heading>
        <p className="text-sm leading-relaxed text-muted-foreground break-words">
          {message}
        </p>
      </div>
      {(action || secondaryAction) && (
        <div
          className={cn(
            "grid gap-4",
            action && secondaryAction && "sm:grid-cols-2",
          )}
        >
          {action && (
            <ArcadeButton variant="primary" className="w-full" onClick={action.onClick}>
              {action.label}
            </ArcadeButton>
          )}
          {secondaryAction && (
            <ArcadeButton
              variant="secondary"
              className="w-full"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </ArcadeButton>
          )}
        </div>
      )}
    </ArcadeCard>
  );

  if (!fullScreen) return panel;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {panel}
    </div>
  );
};
