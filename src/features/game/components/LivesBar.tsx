import { cn } from "@/shared/lib/utils";

interface LivesBarProps {
  lives: number;
  maxLives: number;
  size?: "sm" | "md";
  /** Fill from the right, for a HUD on the right side of the screen. */
  reverse?: boolean;
  className?: string;
}

/** A row of pixel hearts, full for each life left. */
export const LivesBar = ({
  lives,
  maxLives,
  size = "md",
  reverse = false,
  className,
}: LivesBarProps) => (
  <div
    className={cn(
      "flex",
      size === "md" ? "gap-2" : "gap-0.5",
      reverse && "flex-row-reverse",
      className,
    )}
    role="img"
    aria-label={`${Math.max(lives, 0)} of ${maxLives} lives left`}
  >
    {Array.from({ length: maxLives }, (_, i) => (
      <img
        key={i}
        src={
          i < lives
            ? "/resources/hud/heart-full.png"
            : "/resources/hud/heart-empty.png"
        }
        alt=""
        className={size === "md" ? "w-9 h-9" : "w-5 h-5"}
        style={{ imageRendering: "pixelated" }}
      />
    ))}
  </div>
);
