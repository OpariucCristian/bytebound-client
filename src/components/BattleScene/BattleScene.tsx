import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Enemy from "./Enemy";
import Player from "./Player";
import { BattleAction, BattleActionEnum } from "@/types/gameTypes";
import { DEMON_SPRITES, PLAYER_SPRITES } from "@/utils/spriteConfigs";
import { ReadNewGameDto } from "@/hooks";
import { getEnemySpritePerDifficulty } from "@/utils/spriteUtils";

interface BattleSceneProps {
  action: BattleAction;
  onIntroComplete?: () => void;
  questionDifficulty?: number;
}

export default function BattleScene({
  action,
  onIntroComplete,
  questionDifficulty
}: BattleSceneProps) {
  const [playerIntroComplete, setPlayerIntroComplete] = useState(false);
  const [enemyIntroComplete, setEnemyIntroComplete] = useState(false);

  useEffect(() => {
    if (playerIntroComplete && enemyIntroComplete && action === "start-game") {
      onIntroComplete?.();
    }
  }, [playerIntroComplete, enemyIntroComplete, action, onIntroComplete]);

  const enemy_sprites = useMemo(() => {
    const difficulty = questionDifficulty ?? 1;
    return getEnemySpritePerDifficulty(difficulty);
  }, [questionDifficulty]);

  return (
    <div className="relative w-full max-w-[60rem] h-52 border-2 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-[url('/resources/backgrounds/cave.png')] bg-cover bg-bottom opacity-90"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Player (Left Side) */}
      <Player
        action={action}
        sprites={PLAYER_SPRITES}
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
          </p>
        </div>
      )}
    </div>
  );
}
