import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/lib/utils";
import PlayerComponent from "@/features/game/components/BattleScene/Player";
import {
  BattleAction,
  BattleActionEnum,
} from "@/features/game/types/gameTypes";
import { LivesBar } from "@/features/game/components/LivesBar";
import { CHARACTER_SPRITES } from "@/shared/utils/spriteConfigs";
import type { Fighter } from "@/shared/services/versusService";

export interface DuelBanner {
  text: string;
  tone: "good" | "bad" | "neutral";
}

interface DuelSceneProps {
  you: Fighter;
  opponent: Fighter;
  yourLives: number;
  opponentLives: number;
  /** Uses the solo action names: PLAYER_ATTACK attacks, ENEMY_ATTACK is hurt. */
  yourAction: BattleAction;
  opponentAction: BattleAction;
  banner: DuelBanner | null;
  /** Called once both heroes finished walking in. */
  onIntroComplete?: () => void;
}

const NameTag = ({
  fighter,
  lives,
  align,
}: {
  fighter: Fighter;
  lives: number;
  align: "left" | "right";
}) => (
  <div
    className={cn(
      "absolute top-0 mt-2 flex flex-col gap-1",
      align === "left" ? "left-0 ml-2 items-start" : "right-0 mr-2 items-end",
    )}
  >
    <p className="text-xs sm:text-sm drop-shadow-[0_2px_0_rgba(0,0,0,0.9)]">
      {fighter.userName}
      <span className="text-muted-foreground"> LV{fighter.lvl}</span>
    </p>
    <LivesBar
      size="sm"
      lives={lives}
      maxLives={fighter.hero.baseHealth}
      reverse={align === "right"}
    />
  </div>
);

/** Two heroes facing each other in the cave, one per player. */
export default function DuelScene({
  you,
  opponent,
  yourLives,
  opponentLives,
  yourAction,
  opponentAction,
  banner,
  onIntroComplete,
}: DuelSceneProps) {
  const [yourIntroDone, setYourIntroDone] = useState(false);
  const [opponentIntroDone, setOpponentIntroDone] = useState(false);

  const yourSprites = useMemo(
    () => CHARACTER_SPRITES[you.hero.spriteKey],
    [you.hero.spriteKey],
  );
  const opponentSprites = useMemo(
    () => CHARACTER_SPRITES[opponent.hero.spriteKey],
    [opponent.hero.spriteKey],
  );

  useEffect(() => {
    if (
      yourIntroDone &&
      opponentIntroDone &&
      yourAction === BattleActionEnum.START_GAME
    ) {
      onIntroComplete?.();
    }
  }, [yourIntroDone, opponentIntroDone, yourAction, onIntroComplete]);

  return (
    <div className="relative w-full max-w-[60rem] h-40 sm:h-48 md:h-52 short:h-32 border-2 overflow-hidden">
      <div
        className="absolute inset-0 bg-[url('/resources/backgrounds/cave.png')] bg-cover bg-bottom opacity-90"
        style={{ imageRendering: "pixelated" }}
      />

      <NameTag fighter={you} lives={yourLives} align="left" />
      <NameTag fighter={opponent} lives={opponentLives} align="right" />

      <PlayerComponent
        action={yourAction}
        sprites={yourSprites}
        onIntroComplete={() => setYourIntroDone(true)}
      />
      <PlayerComponent
        action={opponentAction}
        sprites={opponentSprites}
        side="right"
        muted
        onIntroComplete={() => setOpponentIntroDone(true)}
      />

      {banner && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p
            className={cn(
              "text-base sm:text-xl font-bold arcade-text animate-pulse motion-reduce:animate-none",
              banner.tone === "good" && "text-neon-green",
              banner.tone === "bad" && "text-destructive",
              banner.tone === "neutral" && "text-accent",
            )}
          >
            {banner.text}
          </p>
        </div>
      )}
    </div>
  );
}
