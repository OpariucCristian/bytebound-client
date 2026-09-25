import * as React from "react";
import { Root as ProgressRoot, Indicator as ProgressIndicator } from "@radix-ui/react-progress";

import { cn } from "@/shared/lib/utils";

type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressRoot>;

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max, ...props }, ref) => (
    <ProgressRoot
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <ProgressIndicator
        className="h-full w-full flex-1 bg-secondary transition-all"
        // Out-of-range or missing values (e.g. while loading) clamp to 0-100%
        style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, ((value ?? 0) / (max || 100)) * 100))}%)` }}
      />
    </ProgressRoot>
  ),
);
Progress.displayName = "Progress";

export { Progress };
