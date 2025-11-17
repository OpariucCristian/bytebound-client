import { Button } from "./Button";
import { useAudio } from "@/contexts/AudioContext";

interface AudioButtonProps {}

export const AudioButton = () => {
  const { isAudioPlaying, hasInteracted, startAudio, stopAudio, dismissReminder } = useAudio();
  const showReminder = !hasInteracted;
  
  return (
    <div className="absolute bottom-4 left-4">
      <Button
        className="w-12 h-12 p-2 backdrop-blur-md border relative"
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
      {showReminder && (
        <div className="mt-2 bg-black/80 backdrop-blur-md border border-yellow-500/50 rounded-lg px-3 py-2 text-xs text-yellow-200 whitespace-nowrap animate-pulse flex items-center gap-2">
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
