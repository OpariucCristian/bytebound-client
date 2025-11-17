import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { BattleAction, BattleActionEnum } from "@/types/gameTypes";
import { CharacterSprites } from "@/types/characterTypes";
import { useSpriteAnimation } from "@/hooks/useSpriteAnimation";

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
  const {
    currentSprite,
    framePercentage,
    updateSpriteAnimation,
  } = useSpriteAnimation({
    action,
    sprites,
    onIntroComplete,
    initialSprite: "IDLE",
  });

  useEffect(() => {
    switch (action) {
      case BattleActionEnum.START_GAME:
        updateSpriteAnimation(sprites.IDLE);
        return;
      case BattleActionEnum.ENEMY_ATTACK:
      case BattleActionEnum.ENEMY_WIN:
        updateSpriteAnimation(sprites.ATTACK);
        return;
      case BattleActionEnum.PLAYER_ATTACK:
        updateSpriteAnimation(sprites.HURT);
        return;
      case BattleActionEnum.IDLE:
        updateSpriteAnimation(sprites.IDLE);
        return;
      default:
        updateSpriteAnimation(sprites.IDLE);
        return;
    }
  }, [action, sprites]);

  const enemySize = sprites.size || 128;
  const enemyFlip = sprites.flipHorizontal || false;
  const enemyBottomOffset = sprites.bottomOffset ?? 8;

  const enemyAttacking = action === BattleActionEnum.ENEMY_ATTACK;

  return (
    <div
      className={cn(
        "absolute bottom-0 right-80 transition-all duration-150",
        enemyAttacking ? "-translate-x-4" : "translate-x-0"
      )}
      style={{
        bottom: `${enemyBottomOffset}px`,
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

      {/* Attack Effect */}
      {enemyAttacking && (
        <div className="absolute top-8 left-0 text-2xl animate-ping">💥</div>
      )}
    </div>
  );
}
