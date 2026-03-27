import { CharacterSprites } from "@/features/game/types/characterTypes";

const PLAYER_SPRITES: CharacterSprites = {
  IDLE: { frames: 7, src: "/resources/characters_knight/IDLE.png" },
  ATTACK_1: { frames: 6, src: "/resources/characters_knight/ATTACK1.png", sound: "/resources/characters_knight/sounds/ATTACK1.wav" },
  ATTACK_2: { frames: 5, src: "/resources/characters_knight/ATTACK2.png", sound: "/resources/characters_knight/sounds/ATTACK2.wav" },
  ATTACK_3: { frames: 6, src: "/resources/characters_knight/ATTACK3.png", sound: "/resources/characters_knight/sounds/ATTACK3.wav" },
  HURT: { frames: 4, src: "/resources/characters_knight/HURT.png", sound: "/resources/characters_knight/sounds/HURT.wav" },
  DEATH: { frames: 12, src: "/resources/characters_knight/DEATH.png", sound: "/resources/characters_knight/sounds/DEATH.mp3" },
  WALK: { frames: 8, src: "/resources/characters_knight/RUN.png" },
};

const PLAYER_2_SPRITES: CharacterSprites = {
  IDLE: { frames: 8, src: "/resources/characters_wizard/IDLE.png" },
  ATTACK_1: { frames: 7, src: "/resources/characters_wizard/ATTACK_1.png" },
  ATTACK_2: { frames: 9, src: "/resources/characters_wizard/ATTACK_2.png" },
  HURT: { frames: 4, src: "/resources/characters_wizard/HURT.png" },
  DEATH: { frames: 4, src: "/resources/characters_wizard/DEATH.png" },
  WALK: { frames: 7, src: "/resources/characters_wizard/WALK.png" },
};

const DEMON_SPRITES: CharacterSprites = {
  IDLE: { frames: 4, src: "/resources/demon/IDLE.png" },
  ATTACK: { frames: 8, src: "/resources/demon/ATTACK.png" },
  HURT: { frames: 4, src: "/resources/demon/HURT.png" },
  DEATH: { frames: 7, src: "/resources/demon/DEATH.png" },
  WALK: { frames: 4, src: "/resources/demon/WALK.png" },
  size: 128,
  bottomOffset: 35,
};

const SKELETON_SPRITES: CharacterSprites = {
  IDLE: { frames: 4, src: "/resources/skeleton/IDLE.png" },
  ATTACK: { frames: 8, src: "/resources/skeleton/ATTACK.png" },
  HURT: { frames: 4, src: "/resources/skeleton/HURT.png" },
  DEATH: { frames: 4, src: "/resources/skeleton/DEATH.png" },
  WALK: { frames: 4, src: "/resources/skeleton/WALK.png" },
  size: 208,
  flipHorizontal: true,
  bottomOffset: -35,
};

export { PLAYER_SPRITES, PLAYER_2_SPRITES, DEMON_SPRITES, SKELETON_SPRITES };
