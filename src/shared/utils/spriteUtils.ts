import { ENEMY_SPRITES } from "./spriteConfigs";

export const getEnemySpritePerDifficulty = (difficulty: number) => {
    console.debug("Getting enemy sprites for difficulty:", difficulty);
  switch (difficulty) {
    case 1:
        return ENEMY_SPRITES.enemy_demon;
    case 2:
        return ENEMY_SPRITES.enemy_skeleton;
    default:
        return ENEMY_SPRITES.enemy_demon;
  }
};