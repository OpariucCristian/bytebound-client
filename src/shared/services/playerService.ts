import { httpService } from './httpService';

// Player Types
export interface Player {
  id: number;
  createdAt: string;
  uid: string | null;
  lvl: number | null;
  xp?: number;
  neededXp?: number;
  userName: string | null;
}

export interface CreatePlayerDto {
  uid: string;
  lvl?: number | null;
}

export interface UpdatePlayerDto {
  uid?: string | null;
  lvl?: number | null;
}

// Query Keys
export const playerQueryKeys = {
  byUid: (uid: string) => ["players", "uid", uid] as const,
};

// Service functions
export const getPlayerByUid = async (): Promise<Player> => {
  return httpService.get<Player>(`players`);
};
