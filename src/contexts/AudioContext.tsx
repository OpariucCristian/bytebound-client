import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
} from "react";

interface AudioContextType {
  isAudioPlaying?: boolean;
  stopAudio?: () => void;
  startAudio?: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(true);

  const startAudio = () => {
    setIsAudioPlaying(true);
  };

  const stopAudio = () => {
    setIsAudioPlaying(false);
  };

  const value: AudioContextType = {
    stopAudio,
    startAudio,
    isAudioPlaying,
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
