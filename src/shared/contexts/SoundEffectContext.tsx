import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useAudio } from "./AudioContext";
import { CHARACTER_SPRITES } from "@/shared/utils/spriteConfigs";

/** Every sound effect the sprites reference, so they can load ahead of use. */
const collectSounds = (node: unknown, found = new Set<string>()): Set<string> => {
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "sound" && typeof value === "string") found.add(value);
      else collectSounds(value, found);
    }
  }
  return found;
};

// Loaded once and cloned per play, so overlapping hits don't cut each other off
const cache = new Map<string, HTMLAudioElement>();
const load = (effect: string) => {
  let audio = cache.get(effect);
  if (!audio) {
    audio = new Audio(effect);
    audio.preload = "auto";
    cache.set(effect, audio);
  }
  return audio;
};

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

  // Fetch the effects as soon as sound is on, not on the first hit
  useEffect(() => {
    if (isAudioPlaying) collectSounds(CHARACTER_SPRITES).forEach(load);
  }, [isAudioPlaying]);

  const playSoundEffect = (effect: string) => {
    if (!isAudioPlaying) {
      return;
    }
    const audio = load(effect).cloneNode() as HTMLAudioElement;
    void audio.play().catch(() => {
      // Autoplay blocked or the file failed; the game goes on silently
    });
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
