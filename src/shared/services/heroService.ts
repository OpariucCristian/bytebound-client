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

export const playerQueryKeys = {
  getHeroes: () => ["heroes"] as const,
};

export const getHeroes= async (): Promise<Hero[]> => {
  return httpService.get<Hero[]>(`heroes`);
};

