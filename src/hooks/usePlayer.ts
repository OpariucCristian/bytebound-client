import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHttp } from "./useHttp";

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
  byUid: (uid: string) => ["players", "uid", uid] as const,
};

export const usePlayerByUid = (uid: string | undefined) => {
  const http = useHttp();

  return useQuery({
    queryKey: playerQueryKeys.byUid(uid || ""),
    queryFn: () => http.get<Player>(`/Players/${uid}`),
    enabled: !!uid,
  });
};

export const usePlayerApi = () => {
  const http = useHttp();

  return {
    getByUid: (uid: string) => http.get<Player>(`/Players/${uid}`),
  };
};
