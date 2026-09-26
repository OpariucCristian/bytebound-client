import { Lock, Shield, Snowflake, Sparkles, type LucideIcon } from "lucide-react";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/Tooltip";
import { cn } from "@/shared/lib/utils";
import type { RunSkill } from "@/shared/services/gameService";

const SKILL_ICONS: Record<string, LucideIcon> = {
  shields_up: Shield,
  ice_block: Snowflake,
};

/** Colours of the active state, per skill. */
const SKILL_ACTIVE_STYLES: Record<string, string> = {
  shields_up: "border-yellow-300 shadow-[0_0_12px_2px_rgba(253,224,71,0.6)]",
  ice_block: "border-sky-300 shadow-[0_0_12px_2px_rgba(125,211,252,0.6)]",
};

interface SkillBarProps {
  skills: RunSkill[];
  onUse: (skillId: string) => void;
  /** Skills can only be used while a question is open. */
  disabled?: boolean;
  className?: string;
}

/**
 * The hero's skills for this run. Each one can be used once per run, before
 * answering, to affect the current question.
 */
export const SkillBar = ({ skills, onUse, disabled, className }: SkillBarProps) => {
  if (skills.length === 0) return null;

  const anyActive = skills.some((s) => s.active);

  return (
    <div className={cn("flex justify-center gap-3", className)} role="group" aria-label="Skills">
      {skills.map((skill) => {
        const Icon = skill.unlocked ? (SKILL_ICONS[skill.key] ?? Sparkles) : Lock;
        const status = !skill.unlocked
          ? `LV ${skill.unlockAtLvl}`
          : skill.active
            ? "ACTIVE"
            : skill.used
              ? "USED"
              : null;
        const unusable =
          disabled || anyActive || skill.used || !skill.unlocked;

        return (
          <Tooltip key={skill.id}>
            <TooltipTrigger asChild>
              {/* Disabled buttons don't fire pointer events, so the tooltip hangs off a wrapper */}
              <span tabIndex={unusable ? 0 : -1} className="inline-flex">
                <ArcadeButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onUse(skill.id)}
                  disabled={unusable}
                  aria-pressed={skill.active}
                  aria-label={`${skill.name ?? "Skill"}${status ? ` (${status.toLowerCase()})` : ""}. ${skill.description ?? ""}`}
                  className={cn(
                    "flex items-center gap-2 text-[0.625rem] sm:text-xs",
                    skill.active &&
                      cn(
                        "disabled:opacity-100 animate-pulse motion-reduce:animate-none",
                        SKILL_ACTIVE_STYLES[skill.key] ?? "border-accent",
                      ),
                    skill.used && !skill.active && "grayscale",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{skill.name?.toUpperCase()}</span>
                  {status && (
                    <span className="text-muted-foreground">{status}</span>
                  )}
                </ArcadeButton>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-60 text-xs">
              {skill.unlocked
                ? (skill.description ?? skill.name)
                : `Unlocks at level ${skill.unlockAtLvl}.`}
              {skill.unlocked && " Once per run."}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
