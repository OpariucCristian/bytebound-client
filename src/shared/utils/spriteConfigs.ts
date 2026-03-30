const CHARACTER_SPRITES = {
  hero_knight: {
    IDLE: { frames: 7, src: "/resources/characters/player/hero_knight/IDLE.png" },
    ATTACK_1: {
      frames: 6,
      src: "/resources/characters/player/hero_knight/ATTACK1.png",
      sound: "/resources/characters/player/hero_knight/sounds/ATTACK1.wav",
    },
    ATTACK_2: {
      frames: 5,
      src: "/resources/characters/player/hero_knight/ATTACK2.png",
      sound: "/resources/characters/player/hero_knight/sounds/ATTACK2.wav",
    },
    ATTACK_3: {
      frames: 6,
      src: "/resources/characters/player/hero_knight/ATTACK3.png",
      sound: "/resources/characters/player/hero_knight/sounds/ATTACK3.wav",
    },
    HURT: {
      frames: 4,
      src: "/resources/characters/player/hero_knight/HURT.png",
      sound: "/resources/characters/player/hero_knight/sounds/HURT.wav",
    },
    DEATH: {
      frames: 12,
      src: "/resources/characters/player/hero_knight/DEATH.png",
      sound: "/resources/characters/player/hero_knight/sounds/DEATH.mp3",
    },
    WALK: { frames: 8, src: "/resources/characters/player/hero_knight/RUN.png" },
    isMeelee: true,
  },
  hero_wizard: {
    IDLE: { frames: 8, src: "/resources/characters/player/hero_wizard/IDLE.png" },
    ATTACK_1: { frames: 7, src: "/resources/characters/player/hero_wizard/ATTACK_1.png" },
    ATTACK_2: { frames: 9, src: "/resources/characters/player/hero_wizard/ATTACK_2.png" },
    ATTACK_3: { frames: 16, src: "/resources/characters/player/hero_wizard/ATTACK_3.png" },
    HURT: { frames: 4, src: "/resources/characters/player/hero_wizard/HURT.png" },
    DEATH: { frames: 4, src: "/resources/characters/player/hero_wizard/DEATH.png" },
    WALK: { frames: 8, src: "/resources/characters/player/hero_wizard/RUN.png" },
    bottomOffset: 40,
    isMeelee: false,
  },
};

const ENEMY_SPRITES = {
  enemy_demon: {
  IDLE: { frames: 4, src: "/resources/characters/enemy/enemy_demon/IDLE.png" },
  ATTACK: { frames: 8, src: "/resources/characters/enemy/enemy_demon/ATTACK.png" },
  HURT: { frames: 4, src: "/resources/characters/enemy/enemy_demon/HURT.png" },
  DEATH: { frames: 7, src: "/resources/characters/enemy/enemy_demon/DEATH.png" },
  WALK: { frames: 4, src: "/resources/characters/enemy/enemy_demon/WALK.png" },
  size: 128,
  bottomOffset: 35,
},
enemy_skeleton: {
  IDLE: { frames: 4, src: "/resources/characters/enemy/enemy_skeleton/IDLE.png" },
  ATTACK: { frames: 8, src: "/resources/characters/enemy/enemy_skeleton/ATTACK.png" },
  HURT: { frames: 4, src: "/resources/characters/enemy/enemy_skeleton/HURT.png" },
  DEATH: { frames: 4, src: "/resources/characters/enemy/enemy_skeleton/DEATH.png" },
  WALK: { frames: 4, src: "/resources/characters/enemy/enemy_skeleton/WALK.png" },
  size: 208,
  flipHorizontal: true,
  bottomOffset: -35,
}
}

export { CHARACTER_SPRITES, ENEMY_SPRITES };
