import React, { createContext, useContext, ReactNode, useState } from "react";
import { useAudio } from "./AudioContext";

interface SoundEffectContextType {
  playSoundEffect?: (effect: string) => void;
}

const SoundEffectContext = createContext<SoundEffectContextType | undefined>(
  undefined
);

export const SoundEffectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAudioPlaying } = useAudio();
  
  const playSoundEffect = (effect: string) => {
    if (!isAudioPlaying) {
      return;
    }
    const audio = new Audio(effect);
    audio.play();
  };

  const value: SoundEffectContextType = {
    playSoundEffect,
  };

  return (
    <SoundEffectContext.Provider value={value}>
      {children}
    </SoundEffectContext.Provider>
  );
};

export const useSoundEffect = () => {
  const context = useContext(SoundEffectContext);
  if (context === undefined) {
    throw new Error(
      "useSoundEffect must be used within an SoundEffectProvider"
    );
  }
  return context;
};
