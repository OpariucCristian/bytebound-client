import { Button } from "./Button";
import { useAudio } from "@/contexts/AudioContext";

interface AudioButtonProps {}

export const AudioButton = () => {
  const { isAudioPlaying, startAudio, stopAudio } = useAudio();
  return (
    <Button
      className="absolute bottom-4 left-4 w-12 h-12 p-2  backdrop-blur-md border "
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
    </Button>
  );
};
