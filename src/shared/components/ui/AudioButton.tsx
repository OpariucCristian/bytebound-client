import { Button } from "./Button";
import { useAudio } from "@/shared/contexts/AudioContext";

export const AudioButton = () => {
  const { isAudioPlaying, hasInteracted, startAudio, stopAudio, dismissReminder } = useAudio();
  const showReminder = !hasInteracted;
  
  return (
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] sm:bottom-4 sm:right-4 z-40 flex flex-col items-end">
      <Button
        className="w-11 h-11 sm:w-12 sm:h-12 p-2 backdrop-blur-md border relative"
        onClick={isAudioPlaying ? stopAudio : startAudio}
      >
        <img
          className="w-7 h-6"
          src={
            isAudioPlaying
              ? "/resources/hud/sound-on.png"
              : "/resources/hud/sound-off.png"
          }
          alt="Audio Toggle"
        />
        {showReminder && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>
        )}
      </Button>
      {/* Phones keep just the pulsing dot, so the pill never covers the answers */}
      {showReminder && (
        <div className="relative mt-2 hidden sm:flex short:hidden bg-black/80 backdrop-blur-md border border-yellow-500/50 rounded-lg px-3 py-2 text-xs text-yellow-200 whitespace-nowrap animate-pulse items-center gap-2">
          <span>Click to enable audio</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissReminder?.();
            }}
            className="absolute -top-2.5 -right-1.5 ml-1 text-yellow-400 hover:text-yellow-300 font-bold"
            aria-label="Dismiss reminder"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
