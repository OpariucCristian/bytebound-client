import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/lib/utils";
import Enemy from "./Enemy";
import Player from "./Player";
import { BattleAction, BattleActionEnum } from "@/features/game/types/gameTypes";
import { getEnemySpritePerDifficulty } from "@/shared/utils/spriteUtils";
import { CharacterSprites } from "../../types/characterTypes";
import { Hero } from "@/shared/services/heroService";

interface BattleSceneProps {
  action: BattleAction;
  onIntroComplete?: () => void;
  questionDifficulty?: number;
  player: Hero;
  playerSprites: CharacterSprites
}

export default function BattleScene({
  action,
  onIntroComplete,
  questionDifficulty,
  player,
  playerSprites
}: BattleSceneProps) {
  const [playerIntroComplete, setPlayerIntroComplete] = useState(false);
  const [enemyIntroComplete, setEnemyIntroComplete] = useState(false);
  const [previousAction, setPreviousAction] = useState<BattleAction>(action);

  useEffect(() => {
    // Reset enemy intro complete when difficulty changes
    if (action === "difficulty-change" && previousAction !== "difficulty-change") {
      setEnemyIntroComplete(false);
    }
    setPreviousAction(action);
  }, [action]);

  useEffect(() => {
    if (playerIntroComplete && enemyIntroComplete && action === "start-game") {
      onIntroComplete?.();
    }
    // Only call onIntroComplete if we've actually reset and the animation completed
    if (enemyIntroComplete && action === "difficulty-change" && previousAction === "difficulty-change") {
      onIntroComplete?.();
    }
  }, [playerIntroComplete, enemyIntroComplete, action, previousAction, onIntroComplete]);

  const enemy_sprites = useMemo(() => {
    const difficulty = questionDifficulty ?? 1;
    return getEnemySpritePerDifficulty(difficulty);
  }, [questionDifficulty]);

  return (
    <div className="relative w-full max-w-[60rem] h-40 sm:h-48 md:h-52 border-2 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-[url('/resources/backgrounds/cave.png')] bg-cover bg-bottom opacity-90"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Player (Left Side) */}
      <Player
        action={action}
        sprites={playerSprites}
        onIntroComplete={() => setPlayerIntroComplete(true)}
      />

      {/* Enemy (Right Side) */}
      <Enemy
        action={action}
        sprites={enemy_sprites}
        onIntroComplete={() => setEnemyIntroComplete(true)}
      />

      {/* Action Text */}
      {action !== "idle" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <p
            className={cn(
              "text-xl font-bold arcade-text animate-pulse",
              action === "player-attack" ? "text-neon-green" : "text-red-500"
            )}
          >
            {action === BattleActionEnum.PLAYER_ATTACK && "CORRECT ANSWER!"}
            {action === BattleActionEnum.ENEMY_ATTACK && "WRONG ANSWER!"}
            {action === BattleActionEnum.ENEMY_WIN && "ENEMY WINS!"}
            {action === BattleActionEnum.START_GAME && "BATTLE START!"}
            {action === BattleActionEnum.DIFFICULTY_CHANGE && "NEW ENEMY!"}
          </p>
        </div>
      )}
    </div>
  );
}
