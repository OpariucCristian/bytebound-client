import { Lock, Sparkles } from "lucide-react";
import { SkillIcon } from "@/features/game/components/SkillIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/Tooltip";
import { cn } from "@/shared/lib/utils";
import type { RunSkill } from "@/shared/services/gameService";

interface SkillBarProps {
  skills: RunSkill[];
  onUse: (skillId: string) => void;
  /** Skills can only be used while a question is open. */
  disabled?: boolean;
  /** Why a skill can't be used right now, if it can't. */
  unavailableReason?: (skill: RunSkill) => string | null;
  className?: string;
}

// Hard 2px bevel, light top-left and dark bottom-right, drawn over the icon
const BEVEL =
  "shadow-[inset_2px_2px_0_0_rgb(255_255_255/0.2),inset_-2px_-2px_0_0_rgb(0_0_0/0.55)]";

/**
 * The hero's skills for this run, as an action bar of square icon slots.
 * Each one can be used once per run, before answering, to affect the current
 * question.
 */
export const SkillBar = ({
  skills,
  onUse,
  disabled,
  unavailableReason,
  className,
}: SkillBarProps) => {
  if (skills.length === 0) return null;

  const anyActive = skills.some((s) => s.active);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <p id="skill-bar-label" className="text-muted-foreground text-[0.625rem] sm:text-xs">
        SKILLS
      </p>
      <div
        role="group"
        aria-labelledby="skill-bar-label"
        className="flex gap-1.5 bg-card p-1.5 arcade-border-shadowless"
      >
        {skills.map((skill) => {
          const status = !skill.unlocked
            ? `LV ${skill.unlockAtLvl}`
            : skill.active
              ? "ACTIVE"
              : skill.used
                ? "USED"
                : null;
          const reason = skill.unlocked && !skill.used ? unavailableReason?.(skill) : null;
          // Only one skill can be pending on a question; instant ones apply right away
          const unusable =
            disabled ||
            (anyActive && !skill.instant) ||
            skill.used ||
            !skill.unlocked ||
            !!reason;

          return (
            <Tooltip key={skill.id}>
              <TooltipTrigger asChild>
                {/* Disabled buttons don't fire pointer events, so the tooltip hangs off a wrapper */}
                <span tabIndex={unusable ? 0 : -1} className="inline-flex">
                  <button
                    type="button"
                    onClick={() => onUse(skill.id)}
                    disabled={unusable}
                    aria-pressed={skill.active}
                    aria-label={`${skill.name ?? "Skill"}${status ? ` (${status.toLowerCase()})` : ""}. ${skill.description ?? ""}`}
                    className={cn(
                      "relative size-10 overflow-hidden border-2 border-black bg-black/60",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      "enabled:hover:border-accent/70 enabled:active:brightness-75",
                      "disabled:cursor-not-allowed",
                      skill.active && "border-accent",
                    )}
                  >
                    {skill.unlocked ? (
                      <SkillIcon
                        skillKey={skill.key}
                        size={36}
                        className={cn(
                          "size-full",
                          skill.used && !skill.active && "grayscale brightness-50",
                        )}
                        fallback={<Sparkles className="m-auto h-5 w-5" aria-hidden />}
                      />
                    ) : (
                      <Lock className="m-auto h-5 w-5 text-muted-foreground" aria-hidden />
                    )}
                    <span aria-hidden className={cn("pointer-events-none absolute inset-0", BEVEL)} />
                    {!skill.unlocked && (
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0.5 text-center text-[0.5rem] leading-none text-foreground arcade-glow"
                      >
                        {status}
                      </span>
                    )}
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-60 space-y-1 text-xs">
                <p className="text-accent">{skill.name}</p>
                <p>
                  {skill.unlocked
                    ? skill.description
                    : `Unlocks at level ${skill.unlockAtLvl}.`}
                </p>
                {skill.unlocked && (
                  <p className="text-muted-foreground">
                    {skill.used ? "Used this run." : (reason ?? "Once per run.")}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
