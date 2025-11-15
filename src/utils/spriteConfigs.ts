import { CharacterSprites } from "@/types/characterTypes";

const PLAYER_SPRITES: CharacterSprites = {
  IDLE: { frames: 7, src: "/resources/knight/IDLE.png" },
  ATTACK_1: { frames: 6, src: "/resources/knight/ATTACK1.png" },
  ATTACK_2: { frames: 5, src: "/resources/knight/ATTACK2.png" },
  ATTACK_3: { frames: 6, src: "/resources/knight/ATTACK3.png" },
  HURT: { frames: 4, src: "/resources/knight/HURT.png" },
  DEATH: { frames: 12, src: "/resources/knight/DEATH.png" },
  WALK: { frames: 8, src: "/resources/knight/RUN.png" },
};

const PLAYER_2_SPRITES: CharacterSprites = {
  IDLE: { frames: 8, src: "/resources/wizard/IDLE.png" },
  ATTACK_1: { frames: 7, src: "/resources/wizard/ATTACK_1.png" },
  ATTACK_2: { frames: 9, src: "/resources/wizard/ATTACK_2.png" },
  HURT: { frames: 4, src: "/resources/wizard/HURT.png" },
  DEATH: { frames: 4, src: "/resources/wizard/DEATH.png" },
};

const ENEMY_SPRITES: CharacterSprites = {
  IDLE: { frames: 4, src: "/resources/demon/IDLE.png" },
  ATTACK: { frames: 8, src: "/resources/demon/ATTACK.png" },
  HURT: { frames: 4, src: "/resources/demon/HURT.png" },
  size: 128,
  bottomOffset: 35,
};

const SKELETON_SPRITES: CharacterSprites = {
  IDLE: { frames: 4, src: "/resources/skeleton/IDLE.png" },
  ATTACK: { frames: 8, src: "/resources/skeleton/ATTACK.png" },
  HURT: { frames: 4, src: "/resources/skeleton/HURT.png" },
  size: 208,
  flipHorizontal: true,
  bottomOffset: -35,
};

export { PLAYER_SPRITES, PLAYER_2_SPRITES, ENEMY_SPRITES, SKELETON_SPRITES };
