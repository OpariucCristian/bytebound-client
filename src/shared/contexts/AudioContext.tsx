import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
} from "react";

interface AudioContextType {
  isAudioPlaying?: boolean;
  hasInteracted?: boolean;
  stopAudio?: () => void;
  startAudio?: () => void;
  dismissReminder?: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const startAudio = () => {
    setIsAudioPlaying(true);
    setHasInteracted(true);
  };

  const stopAudio = () => {
    setIsAudioPlaying(false);
  };

  const dismissReminder = () => {
    setHasInteracted(true);
  };

  const value: AudioContextType = {
    stopAudio,
    startAudio,
    isAudioPlaying,
    hasInteracted,
    dismissReminder,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
