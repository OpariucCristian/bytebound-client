import { DEMON_SPRITES, SKELETON_SPRITES } from "./spriteConfigs";

export const getEnemySpritePerDifficulty = (difficulty: number) => {
    console.log("Getting enemy sprites for difficulty:", difficulty);
  switch (difficulty) {
    case 1:
        return DEMON_SPRITES;
    case 2:
        return SKELETON_SPRITES;
    default:
        return DEMON_SPRITES;
  }
};