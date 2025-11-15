import { useQuery } from '@tanstack/react-query';
import { useHttp } from './useHttp';

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

export const useAllLevels = () => {
  const http = useHttp();
  
  return useQuery({
    queryKey: levelQueryKeys.all,
    queryFn: () => http.get<Level[]>('/levels'),
  });
};

export const useLevel = (lvl: number) => {
  const http = useHttp();
  
  return useQuery({
    queryKey: levelQueryKeys.byLevel(lvl),
    queryFn: () => http.get<Level>(`/levels/${lvl}`),
    enabled: !!lvl,
  });
};
