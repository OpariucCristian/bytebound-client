import { MusicTracks } from "@/utils/musicUtils";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useAudio } from "./AudioContext";

interface MusicContextType {
  currentTrack?: MusicTracks;
  changeTrack?: (newTrack: MusicTracks) => void;
  stopMusic?: () => void;
  playMusic?: () => void;
  restartMusic?: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAudioPlaying, stopAudio } = useAudio();
  const [currentTrackPath, setCurrentTrackPath] = useState<MusicTracks>(
    MusicTracks.MENU
  );
  const [currentTrack, setCurrentTrack] = useState<HTMLAudioElement>(
    new Audio(currentTrackPath)
  );

  const playMusic = () => {
    if (!currentTrack.paused || !isAudioPlaying) {
      return;
    }
    currentTrack.loop = true;
    currentTrack.play().catch(() => {
      // Silently handle autoplay prevention - user needs to interact first
    });
  };

  const restartMusic = () => {
    if (!currentTrack.paused || !isAudioPlaying) {
      return;
    }
    currentTrack.loop = true;
    currentTrack.currentTime = 0;
    currentTrack.play().catch(() => {
      stopAudio();
    });
  };

  const stopMusic = () => {
    currentTrack.pause();
  };

  const changeTrack = (newTrack: MusicTracks) => {
    if(!isAudioPlaying || newTrack === currentTrackPath) {
      return;
    }
    currentTrack.pause();
    const newAudio = new Audio(newTrack);
    setCurrentTrack(newAudio);
    setCurrentTrackPath(newTrack);
    newAudio.play();
  };

  const value: MusicContextType = {
    changeTrack,
    stopMusic,
    playMusic,
    restartMusic,
  };

  useEffect(() => {
    if (isAudioPlaying) {
      playMusic();
    } else {
      stopMusic();
    }
  }, [currentTrackPath, isAudioPlaying]);

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
