import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BattleAction, BattleActionEnum } from "@/types/gameTypes";
import { CharacterSprites } from "@/types/characterTypes";
import { useSpriteAnimation } from "@/components/BattleScene/useSpriteAnimation";
import { useSoundEffect } from "@/contexts/SoundEffectContext";
import { useMusic } from "@/contexts/MusicContext";

interface PlayerProps {
  action: BattleAction;
  sprites: CharacterSprites;
  onIntroComplete?: () => void;
}

export default function Player({
  action,
  sprites,
  onIntroComplete,
}: PlayerProps) {
  const [hasIntroStarted, setHasIntroStarted] = useState(false);

  const {
    currentSprite,
    framePercentage,

    updateSpriteAnimation,
  } = useSpriteAnimation({
    action,
    sprites,
    onIntroComplete,
    initialSprite: "WALK",
  });

  const { playSoundEffect } = useSoundEffect();
  const { stopMusic } = useMusic();

  useEffect(() => {
    switch (action) {
      case BattleActionEnum.START_GAME:
        setHasIntroStarted(false);
        updateSpriteAnimation(sprites.WALK);

        setTimeout(() => {
          setHasIntroStarted(true);
        }, 50);
        return;
      case BattleActionEnum.PLAYER_ATTACK:
        const attackSprites = [sprites.ATTACK_1, sprites.ATTACK_2, sprites.ATTACK_3].filter(
          Boolean
        );
        const randomAttack =
          attackSprites[Math.floor(Math.random() * attackSprites.length)];
        updateSpriteAnimation(randomAttack);
        if (randomAttack?.sound) {
          playSoundEffect(randomAttack.sound);
        }
        return;
      case BattleActionEnum.ENEMY_ATTACK:
        updateSpriteAnimation(sprites.HURT);
        if (sprites.HURT.sound) {
          playSoundEffect(sprites.HURT.sound);
        }
        return;
      case BattleActionEnum.IDLE:
        updateSpriteAnimation(sprites.IDLE);
        return;
      case BattleActionEnum.ENEMY_WIN:
        updateSpriteAnimation(sprites.DEATH);
        stopMusic();
        if (sprites.DEATH?.sound) {
          playSoundEffect(sprites.DEATH.sound);
        }
        return;
      default:
        updateSpriteAnimation(sprites.IDLE);
        return;
    }
  }, [action, sprites]);

  const playerAttacking = action === BattleActionEnum.PLAYER_ATTACK;

  const playerSize = sprites.size || 128;
  const playerBottomOffset = sprites.bottomOffset ?? 0;

  return (
    <div
      className={cn(
        "absolute bottom-0 transition-all",
        playerAttacking && "translate-x-12",
        // start at left-36, then transition to left-80 once intro has started
        !hasIntroStarted ? "left-20 sm:left-28 lg-custom:left-32 md:left-36" : "left-48 sm:left-64 lg-custom:left-80 md:left-56",
      )}
      style={{
        bottom: `${playerBottomOffset}px`,
        transitionDuration: action === "start-game" ? "2000ms" : "150ms",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: `${playerSize}px`,
          height: `${playerSize}px`,
          backgroundImage: `url(${currentSprite.src})`,
          backgroundSize: `${currentSprite.frames * 100}% 100%`,
          backgroundPosition: `${framePercentage}% 0`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }}
      />

      {/* Attack Effect */}
      {playerAttacking && (
        <div className="absolute top-4 -right-4 text-2xl animate-ping">⚔️</div>
      )}
    </div>
  );
}
