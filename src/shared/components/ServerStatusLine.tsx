import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useServerStatus, waitForServer } from "@/shared/services/serverStatus";

/** Roughly how long the free-tier server takes to wake. */
const TYPICAL_WAKE_S = 60;
const SEGMENTS = 12;

const formatElapsed = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * Says whether the game server is awake. Free hosting sleeps when idle, so the
 * first visit of the day can take up to a minute; this makes the wait visible
 * instead of letting screens fail.
 */
export const ServerStatusLine = ({ className }: { className?: string }) => {
  const { state, startedAt } = useServerStatus();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (state !== "waking") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [state]);

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const filled = Math.min(SEGMENTS - 1, Math.floor((elapsed / TYPICAL_WAKE_S) * SEGMENTS));

  return (
    <div className={cn("w-full text-xs leading-relaxed", className)}>
      <p role="status" aria-live="polite" className="sr-only">
        {state === "waking" && "Waking the game server. This can take up to a minute."}
        {state === "ready" && "Game server is ready."}
        {state === "unreachable" && "The game server is not answering."}
      </p>

      {state === "waking" && (
        <div aria-hidden="true" className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4 text-foreground">
            <span>WAKING THE SERVER</span>
            <span className="tabular-nums text-muted-foreground">{formatElapsed(elapsed)}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 flex-1",
                  i < filled ? "bg-accent" : i === filled ? "bg-accent animate-blink motion-reduce:animate-none" : "bg-muted",
                )}
              />
            ))}
          </div>
          <span className="text-muted-foreground">
            Free hosting naps when nobody's playing. Up to a minute.
          </span>
        </div>
      )}

      {state === "unreachable" && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-foreground">
          <span aria-hidden="true">THE SERVER ISN'T ANSWERING</span>
          <button
            type="button"
            onClick={() => void waitForServer()}
            className="text-accent underline underline-offset-4 decoration-2 hover:text-foreground"
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
