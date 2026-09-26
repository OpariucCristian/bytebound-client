import { Lock, Sparkles } from "lucide-react";
import { SkillIcon } from "@/features/game/components/SkillIcon";
import { SKILL_SLOT_BEVEL } from "@/features/game/components/SkillBar";
import { cn } from "@/shared/lib/utils";
import type { HeroSkill } from "@/shared/services/heroService";

interface ProgressionTrackProps {
  skills: HeroSkill[];
  playerLvl: number;
  className?: string;
}

interface Stop {
  lvl: number;
  skills: HeroSkill[];
}

/**
 * The hero's levels as a line, from level 1 to the last skill unlock, with
 * each skill at the level it unlocks. Vertical on small screens, horizontal
 * from lg up.
 */
export const ProgressionTrack = ({
  skills,
  playerLvl,
  className,
}: ProgressionTrackProps) => {
  const lastSkillLvl = Math.max(1, ...skills.map((s) => s.unlockAtLvl));
  const stops: Stop[] = Array.from({ length: lastSkillLvl }, (_, i) => ({
    lvl: i + 1,
    skills: skills.filter((s) => s.unlockAtLvl === i + 1),
  }));
  // Past the last unlock, a final stop marks where the player is
  if (playerLvl > lastSkillLvl) {
    stops.push({ lvl: playerLvl, skills: [] });
  }

  return (
    <ol className={cn("flex flex-col lg:flex-row", className)}>
      {stops.map((stop, i) => {
        const next = stops[i + 1];
        const reached = stop.lvl <= playerLvl;
        const isCurrent = stop.lvl === playerLvl;

        return (
          <li
            key={stop.lvl}
            className="relative flex gap-4 pb-8 lg:flex-1 lg:basis-0 lg:flex-col lg:items-center lg:gap-3 lg:pb-0 last:pb-0"
          >
            {/* The line to the next stop: filled once the player reaches it */}
            {next && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-3.5 top-8 bottom-0 w-1",
                  "lg:left-1/2 lg:-right-1/2 lg:top-3.5 lg:bottom-auto lg:h-1 lg:w-auto",
                  next.lvl <= playerLvl ? "bg-accent" : "bg-border",
                )}
              />
            )}

            <span
              aria-hidden
              className={cn(
                "relative flex size-8 shrink-0 items-center justify-center border-2 text-xs tabular-nums",
                reached
                  ? "border-black bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground",
                isCurrent && "outline outline-2 outline-offset-2 outline-accent",
              )}
            >
              {stop.lvl}
            </span>

            <div className="min-w-0 flex-1 space-y-3 pt-1.5 lg:w-full lg:px-2 lg:pt-0 lg:text-center">
              <p className="flex items-center gap-2 text-xs lg:justify-center">
                <span className={reached ? "text-foreground" : "text-muted-foreground"}>
                  LEVEL {stop.lvl}
                </span>
                {isCurrent && (
                  <span className="bg-accent px-1 py-0.5 text-[0.5rem] leading-none text-accent-foreground">
                    YOU
                  </span>
                )}
              </p>
              {stop.skills.map((skill) => (
                <SkillEntry key={skill.id} skill={skill} locked={!reached} />
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const SkillEntry = ({ skill, locked }: { skill: HeroSkill; locked: boolean }) => (
  <div className="flex gap-3 text-left lg:flex-col lg:items-center lg:text-center">
    <div className="relative size-10 shrink-0 overflow-hidden border-2 border-black bg-black/60">
      <SkillIcon
        skillKey={skill.key}
        size={36}
        className={cn("size-full", locked && "grayscale brightness-50")}
        fallback={<Sparkles className="m-auto mt-2 h-5 w-5" aria-hidden />}
      />
      {locked && (
        <Lock
          className="absolute inset-0 m-auto h-4 w-4 text-foreground"
          aria-hidden
        />
      )}
      <span aria-hidden className={cn("pointer-events-none absolute inset-0", SKILL_SLOT_BEVEL)} />
    </div>
    <div className="min-w-0 space-y-1.5">
      <p className={cn("text-sm", locked ? "text-muted-foreground" : "text-accent")}>
        {skill.name}
      </p>
      <p className="text-[0.625rem] leading-relaxed text-foreground">
        {skill.description}
      </p>
      <p className="text-[0.5rem] leading-relaxed text-muted-foreground">
        {locked
          ? `UNLOCKS AT LV ${skill.unlockAtLvl}`
          : `${skill.instant ? "INSTANT" : "ON NEXT ANSWER"} · ONCE PER RUN`}
      </p>
    </div>
  </div>
);
