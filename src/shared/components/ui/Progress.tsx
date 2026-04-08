import * as React from "react";
import { Root as ProgressRoot, Indicator as ProgressIndicator } from "@radix-ui/react-progress";

import { cn } from "@/shared/lib/utils";

type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressRoot>;

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max, ...props }, ref) => (
    <ProgressRoot
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressIndicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${max || 100 - (value || 0)}%)` }}
      />
    </ProgressRoot>
  ),
);
Progress.displayName = "Progress";

export { Progress };
