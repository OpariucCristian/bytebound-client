import { httpService } from './httpService';

// Level Types
export interface Level {
  lvl: number;
  createdAt: string;
  neededXp: number | null;
}

// Query Keys
export const levelQueryKeys = {
  all: ['levels'] as const,
  byLevel: (lvl: number) => ['levels', lvl] as const,
};

// Service functions
export const getAllLevels = async (): Promise<Level[]> => {
  return httpService.get<Level[]>('levels');
};

export const getLevelByNumber = async (lvl: number): Promise<Level> => {
  return httpService.get<Level>(`levels/${lvl}`);
};
