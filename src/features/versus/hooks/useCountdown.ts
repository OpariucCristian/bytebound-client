import { useEffect, useState } from "react";

/** Whole seconds left until `endsAt` (epoch ms), or null without a deadline. */
export const useCountdown = (endsAt: number | null): number | null => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endsAt) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!endsAt) return null;
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
};
