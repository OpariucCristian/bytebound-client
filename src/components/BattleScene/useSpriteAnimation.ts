import { useEffect, useState } from "react";
import { BattleAction, BattleActionEnum } from "@/types/gameTypes";
import { CharacterSprites, SpriteConfig } from "@/types/characterTypes";

interface UseSpriteAnimationOptions {
  action: BattleAction;
  sprites: CharacterSprites;
  onIntroComplete?: () => void;
  initialSprite?: "WALK" | "IDLE";
}

export function useSpriteAnimation({
  action,
  sprites,
  onIntroComplete,
  initialSprite = "IDLE",
}: UseSpriteAnimationOptions) {
  const [currentSprite, setCurrentSprite] = useState<SpriteConfig>(
    initialSprite === "WALK" && sprites.WALK ? sprites.WALK : sprites.IDLE
  );
  const [currentFrame, setCurrentFrame] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);

  // Handle intro completion callback
  useEffect(() => {
    if (introComplete) {
      onIntroComplete?.();
      setIntroComplete(false);
    }
  }, [introComplete, onIntroComplete]);

  // Frame animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const nextFrame = (prev + 1) % currentSprite.frames;

        // Handle sprite action switch
        if (nextFrame === 0) {
          switch (action) {
            case BattleActionEnum.START_GAME:
            case BattleActionEnum.DIFFICULTY_CHANGE:
              setIntroComplete(true);
              break;
            case BattleActionEnum.ENEMY_WIN:
              return prev;
            default:
              setCurrentSprite(sprites.IDLE);
              break;
          }
        }

        return nextFrame;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [currentSprite, action, sprites]);

  const updateSpriteAnimation = (
    animation: SpriteConfig,
    resetFrame = true
  ) => {
    setCurrentSprite(animation);
    if (resetFrame) {
      setCurrentFrame(0);
    }
  };

  // Calculate background position for sprite
  const framePercentage =
    currentSprite.frames > 1
      ? (currentFrame / (currentSprite.frames - 1)) * 100
      : 0;

  return {
    currentSprite,
    currentFrame,
    framePercentage,
    updateSpriteAnimation,
  };
}
