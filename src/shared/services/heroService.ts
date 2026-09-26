import { httpService } from './httpService';

export interface Hero {
  id: string;
  createdAt: string;
  name: string | null;
  baseHealth: number | null;
  baseAttack?: number | null;
  description?: string | null;
  spriteKey: string;
}

/** A hero skill and the level it unlocks at. */
export interface HeroSkill {
  id: string;
  /** Stable identifier, e.g. "shields_up"; picks the icon. */
  key: string;
  name: string | null;
  description: string | null;
  unlockAtLvl: number;
  /** Applies as soon as it's used, instead of on the next answer. */
  instant: boolean;
}

export const playerQueryKeys = {
  getHeroes: () => ["heroes"] as const,
};

export const heroQueryKeys = {
  skills: (heroId: string) => ["heroes", heroId, "skills"] as const,
};

export const getHeroes= async (): Promise<Hero[]> => {
  return httpService.get<Hero[]>(`heroes`);
};

export const getHeroSkills = async (heroId: string): Promise<HeroSkill[]> => {
  return httpService.get<HeroSkill[]>(`heroes/${heroId}/skills`);
};

