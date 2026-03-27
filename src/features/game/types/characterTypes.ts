export interface CharacterSprites {
  IDLE: SpriteConfig;
  ATTACK_1?: SpriteConfig;
  ATTACK_2?: SpriteConfig;
  ATTACK_3?: SpriteConfig;
  ATTACK?: SpriteConfig;
  DEATH?: SpriteConfig;
  HURT: SpriteConfig;
  WALK?: SpriteConfig;
  size?: number;
  flipHorizontal?: boolean;
  bottomOffset?: number;
  isMeelee?: boolean;
}

export interface SpriteConfig {
  frames: number;
  src: string;
  sound?: string;
}