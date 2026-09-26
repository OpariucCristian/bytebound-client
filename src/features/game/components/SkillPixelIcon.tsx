import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/** One string per row, one character per pixel; "." is transparent. */
type PixelArt = { rows: string[]; palette: Record<string, string> };

const OUTLINE = "#1a1c2c";

const SKILL_ART: Record<string, PixelArt> = {
  shields_up: {
    rows: [
      "##########",
      "#gggggggg#",
      "#gwsssssg#",
      "#gssssssg#",
      "#gssssssg#",
      "#gssssssg#",
      ".#gssssg#.",
      ".#gssssg#.",
      "..#gssg#..",
      "...#gg#...",
      "....##....",
    ],
    palette: { "#": OUTLINE, g: "#e0a526", s: "#94a3b8", w: "#f1f5f9" },
  },
  battle_cry: {
    rows: [
      "....#....",
      "...#w#...",
      "...#s#...",
      "...#s#...",
      "...#s#...",
      "...#s#...",
      "...#s#...",
      ".#######.",
      "#ggggggg#",
      ".###r###.",
      "...#r#...",
      "...#g#...",
      "...###...",
    ],
    palette: { "#": OUTLINE, g: "#e0a526", s: "#94a3b8", w: "#f1f5f9", r: "#b13e53" },
  },
};

interface SkillPixelIconProps {
  skillKey: string;
  /** Size of one art pixel, in screen pixels. */
  scale?: number;
  className?: string;
  /** Shown for skills without pixel art yet. */
  fallback?: ReactNode;
}

/** A skill's small pixel-art marker, drawn crisp at any integer scale. */
export const SkillPixelIcon = ({
  skillKey,
  scale = 2,
  className,
  fallback = null,
}: SkillPixelIconProps) => {
  const art = SKILL_ART[skillKey];
  if (!art) return <>{fallback}</>;

  const width = art.rows[0].length;
  const height = art.rows.length;

  return (
    <svg
      aria-hidden
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={cn("shrink-0", className)}
    >
      {art.rows.flatMap((row, y) =>
        [...row].map((px, x) =>
          px === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={art.palette[px]} />
          ),
        ),
      )}
    </svg>
  );
};
