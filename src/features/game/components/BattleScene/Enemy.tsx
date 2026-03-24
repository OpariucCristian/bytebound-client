import { useEffect, useState, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { BattleAction, BattleActionEnum } from "@/features/game/types/gameTypes";
import { CharacterSprites } from "@/features/game/types/characterTypes";
import { useSpriteAnimation } from "@/features/game/components/BattleScene/useSpriteAnimation";

interface EnemyProps {
  action: BattleAction;
  sprites: CharacterSprites;
  onIntroComplete?: () => void;
}

export default function Enemy({
  action,
  sprites,
  onIntroComplete,
}: EnemyProps) {
  const [hasIntroStarted, setHasIntroStarted] = useState(true);
  const [isPlayingDeath, setIsPlayingDeath] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousSpritesRef = useRef<CharacterSprites>(sprites);
  const walkIntroTimerRef = useRef<NodeJS.Timeout | null>(null);
  const difficultyChangeStartedRef = useRef(false);

  const { currentSprite, framePercentage, updateSpriteAnimation } =
    useSpriteAnimation({
      action: isPlayingDeath ? BattleActionEnum.IDLE : action,
      sprites,
      onIntroComplete,
      initialSprite: "IDLE",
    });

  useEffect(() => {
    return () => {
      if (walkIntroTimerRef.current) {
        clearTimeout(walkIntroTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    switch (action) {
      case BattleActionEnum.START_GAME:
        updateSpriteAnimation(sprites.IDLE);
        previousSpritesRef.current = sprites;
        return;
      case BattleActionEnum.DIFFICULTY_CHANGE:
        if (!isPlayingDeath && !difficultyChangeStartedRef.current) {
          console.debug("Enemy difficulty change detected");
          difficultyChangeStartedRef.current = true;
          setIsPlayingDeath(true);
          updateSpriteAnimation(previousSpritesRef.current.DEATH);
          const deathDuration =
            (previousSpritesRef.current.DEATH?.frames || 6) * 150;
          setTimeout(() => {
            console.debug("Death animation complete, starting walk intro");
            setIsPlayingDeath(false);
            setIsTransitioning(true);
            setHasIntroStarted(false);

            requestAnimationFrame(() => {
              console.debug("Position updated, loading new sprite");
              updateSpriteAnimation(sprites.WALK);
              previousSpritesRef.current = sprites;
              setTimeout(() => {
                setIsTransitioning(false);
                setHasIntroStarted(true);

                walkIntroTimerRef.current = setTimeout(() => {
                  console.debug("Walk intro complete, calling onIntroComplete");
                  onIntroComplete?.();
                }, 2000); 
              }, 50);
            });
          }, deathDuration);
        }
        return;
      case BattleActionEnum.ENEMY_ATTACK:
      case BattleActionEnum.ENEMY_WIN:
        updateSpriteAnimation(sprites.ATTACK);
        return;
      case BattleActionEnum.PLAYER_ATTACK:
        updateSpriteAnimation(sprites.HURT);

        return;
      case BattleActionEnum.IDLE:
        if (!isPlayingDeath && !isTransitioning) {
          if (walkIntroTimerRef.current) {
            clearTimeout(walkIntroTimerRef.current);
            walkIntroTimerRef.current = null;
          }
          difficultyChangeStartedRef.current = false;
          updateSpriteAnimation(sprites.IDLE);
          previousSpritesRef.current = sprites;
        }
        return;
      default:
        if (!isPlayingDeath) {
          updateSpriteAnimation(sprites.IDLE);
          previousSpritesRef.current = sprites;
        }
        return;
    }
  }, [action, isPlayingDeath]);

  const enemySize = sprites.size || 128;
  const enemyFlip = sprites.flipHorizontal || false;
  const enemyBottomOffset = sprites.bottomOffset ?? 8;

  const enemyAttacking = action === BattleActionEnum.ENEMY_ATTACK;
  return (
    <div
      className={cn(
        "absolute bottom-0",
        enemyAttacking && !isTransitioning ? "-translate-x-4" : "translate-x-0",
        !hasIntroStarted
          ? "right-0 sm:right-4 lg-custom:right-6 md:right-8"
          : "right-48 sm:right-64 lg-custom:right-80 md:right-56",
        isTransitioning && "opacity-0"
      )}
      style={{
        bottom: `${enemyBottomOffset}px`,
        transitionProperty: "right, transform",
        transitionDuration:
          !isTransitioning &&
          hasIntroStarted &&
          action !== BattleActionEnum.ENEMY_ATTACK
            ? "2000ms"
            : "150ms",
        transitionTimingFunction: "ease-out",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: `${enemySize}px`,
          height: `${enemySize}px`,
          backgroundImage: `url(${currentSprite.src})`,
          backgroundSize: `${currentSprite.frames * 100}% 100%`,
          backgroundPosition: `${framePercentage}% 0`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          transform: enemyFlip ? "scaleX(-1)" : "none",
        }}
      />

      {enemyAttacking && (
        <div className="absolute top-8 left-0 text-2xl animate-ping">💥</div>
      )}
    </div>
  );
}
