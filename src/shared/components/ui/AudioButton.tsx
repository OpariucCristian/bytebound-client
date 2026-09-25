import { Button } from "./Button";
import { useAudio } from "@/shared/contexts/AudioContext";

/** A pixel cross drawn on the grid, matching the HUD art. */
const PixelCross = () => (
  <svg viewBox="0 0 7 7" className="w-3 h-3" shapeRendering="crispEdges" aria-hidden="true">
    <path
      fill="currentColor"
      d="M0 0h1v1H0zM1 1h1v1H1zM2 2h1v1H2zM3 3h1v1H3zM4 4h1v1H4zM5 5h1v1H5zM6 6h1v1H6zM6 0h1v1H6zM5 1h1v1H5zM4 2h1v1H4zM2 4h1v1H2zM1 5h1v1H1zM0 6h1v1H0z"
    />
  </svg>
);

export const AudioButton = () => {
  const { isAudioPlaying, hasInteracted, startAudio, stopAudio, dismissReminder } = useAudio();
  const showReminder = !hasInteracted;

  return (
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] sm:bottom-4 sm:right-4 z-40 flex flex-col items-end">
      <Button
        className="w-11 h-11 sm:w-12 sm:h-12 p-2 border relative"
        onClick={isAudioPlaying ? stopAudio : startAudio}
        aria-label={isAudioPlaying ? "Turn sound off" : "Turn sound on"}
        aria-pressed={isAudioPlaying}
      >
        <img
          className="w-7 h-6"
          src={
            isAudioPlaying
              ? "/resources/hud/sound-on.png"
              : "/resources/hud/sound-off.png"
          }
          alt=""
        />
        {showReminder && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3" aria-hidden="true">
            <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full bg-accent opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 bg-accent"></span>
          </span>
        )}
      </Button>
      {/* Phones keep just the pulsing dot, so the note never covers the answers */}
      {showReminder && (
        <div className="relative mt-2 hidden sm:flex short:hidden items-center gap-1 bg-card border-2 border-accent pl-3 text-xs text-accent whitespace-nowrap">
          <span className="py-2">Click to enable audio</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissReminder?.();
            }}
            // A 44px hit area around a small cross
            className="flex items-center justify-center w-11 h-11 -my-2 text-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Hide audio reminder"
          >
            <PixelCross />
          </button>
        </div>
      )}
    </div>
  );
};
