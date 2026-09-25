import { ServerStatusLine } from "@/shared/components/ServerStatusLine";
import { useServerStatus } from "@/shared/services/serverStatus";

interface LoadingScreenProps {
  label?: string;
}

/**
 * Full-screen loading state. While the free-tier server is waking it also shows
 * the wake progress, so a long wait reads as "starting up", not "stuck".
 */
export const LoadingScreen = ({ label = "LOADING..." }: LoadingScreenProps) => {
  const { state } = useServerStatus();
  const showServer = state === "waking" || state === "unreachable";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-4">
      <p
        role="status"
        className="text-2xl text-primary text-center animate-blink motion-reduce:animate-none"
      >
        {label}
      </p>
      {showServer && <ServerStatusLine className="max-w-sm" />}
    </div>
  );
};
