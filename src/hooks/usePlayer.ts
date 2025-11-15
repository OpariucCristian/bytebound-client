import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHttp } from './useHttp';

// Player Types
export interface Player {
  id: number;
  createdAt: string;
  uid: string | null;
  lvl: number | null;
  xp?: number;
  neededXp?: number;
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
  all: ['players'] as const,
  byId: (id: number) => ['players', id] as const,
  byUid: (uid: string) => ['players', 'uid', uid] as const,
};

export const useAllPlayers = () => {
  const http = useHttp();
  
  return useQuery({
    queryKey: playerQueryKeys.all,
    queryFn: () => http.get<Player[]>('/Players'),
  });
};

export const usePlayer = (id: number) => {
  const http = useHttp();
  
  return useQuery({
    queryKey: playerQueryKeys.byId(id),
    queryFn: () => http.get<Player>(`/Players/${id}`),
    enabled: !!id,
  });
};

export const usePlayerByUid = (uid: string | undefined) => {
  const http = useHttp();
  
  return useQuery({
    queryKey: playerQueryKeys.byUid(uid || ''),
    queryFn: () => http.get<Player>(`/Players/${uid}`),
    enabled: !!uid,
  }).data;
};

export const usePlayerMutations = () => {
  const http = useHttp();
  const queryClient = useQueryClient();
  
  const createPlayer = useMutation({
    mutationFn: (data: CreatePlayerDto) => http.post<Player, CreatePlayerDto>('/Players', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerQueryKeys.all });
    },
  });
  
  const updatePlayer = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlayerDto }) =>
      http.put<void, UpdatePlayerDto>(`/Players/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: playerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: playerQueryKeys.byId(variables.id) });
    },
  });
  
  const deletePlayer = useMutation({
    mutationFn: (id: number) => http.delete<void>(`/Players/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerQueryKeys.all });
    },
  });
  
  return {
    createPlayer,
    updatePlayer,
    deletePlayer,
  };
};

// Direct API functions for cases where hooks aren't suitable
export const usePlayerApi = () => {
  const http = useHttp();
  
  return {
    getAll: () => http.get<Player[]>('/Players'),
    getById: (id: number) => http.get<Player>(`/Players/${id}`),
    getByUid: (uid: string) => http.get<Player>(`/Players/${uid}`),
    create: (data: CreatePlayerDto) => http.post<Player, CreatePlayerDto>('/Players', data),
    update: (id: number, data: UpdatePlayerDto) => http.put<void, UpdatePlayerDto>(`/Players/${id}`, data),
    delete: (id: number) => http.delete<void>(`/Players/${id}`),
  };
};
