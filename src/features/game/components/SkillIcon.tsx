import type { ReactNode } from "react";
import { hasSkillAssets, skillIconSrc } from "@/features/game/utils/skillUtils";
import { cn } from "@/shared/lib/utils";

interface SkillIconProps {
  skillKey: string;
  /** Rendered size in screen pixels; the icons are ~32px art. */
  size?: number;
  className?: string;
  /** Shown for skills without art yet. */
  fallback?: ReactNode;
}

/** A skill's pixel-art icon, kept crisp when scaled. */
export const SkillIcon = ({
  skillKey,
  size = 32,
  className,
  fallback = null,
}: SkillIconProps) => {
  if (!hasSkillAssets(skillKey)) return <>{fallback}</>;

  return (
    <img
      src={skillIconSrc(skillKey)}
      alt=""
      aria-hidden
      draggable={false}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
      className={cn("shrink-0", className)}
    />
  );
};
