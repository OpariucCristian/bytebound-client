/** Skills with art under /resources/skills/<key>/ (see CREDITS.md there). */
const SKILLS_WITH_ASSETS = new Set([
  "shields_up",
  "battle_cry",
  "second_wind",
  "arcane_insight",
  "time_warp",
  "polymorph",
]);

export const hasSkillAssets = (skillKey: string) =>
  SKILLS_WITH_ASSETS.has(skillKey);

export const skillIconSrc = (skillKey: string) =>
  `/resources/skills/${skillKey}/icon.png`;

/** Played when the skill blocks a hit (only blocking skills have one). */
export const skillBlockSoundSrc = (skillKey: string) =>
  `/resources/skills/${skillKey}/block.ogg`;
