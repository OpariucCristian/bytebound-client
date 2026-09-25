import { httpService } from "./httpService";

// Must match the types in the server's versus/versus.types.ts

export interface Fighter {
  uid: string;
  userName: string;
  lvl: number;
  hero: {
    id: string;
    name: string | null;
    spriteKey: string;
    baseHealth: number;
    baseAttack: number;
  };
}

export interface MatchedPayload {
  matchId: string;
  category: string;
  you: Fighter;
  opponent: Fighter;
}

export interface RoundPayload {
  round: number;
  difficulty: number;
  seconds: number;
  question: {
    id: string;
    text: string | null;
    answers: { id: string; text: string | null }[];
  };
}

export interface RoundStartPayload {
  round: number;
  /** Epoch ms when the answer window closes. */
  endsAt: number;
}

export type LivesByUid = Record<string, number>;

export interface LockedOutPayload {
  round: number;
  uid: string;
  lives: LivesByUid;
}

export interface RoundResultPayload {
  round: number;
  attackerUid: string | null;
  damage: number;
  reason: "correct" | "timeout" | "all_wrong";
  correctAnswerId: string | null;
  lives: LivesByUid;
}

export type MatchResult = "win" | "loss" | "draw";
export type MatchEndReason = "ko" | "forfeit" | "draw" | "idle" | "error";

export interface MatchPlayerSummary {
  uid: string;
  userName: string;
  heroId: string;
  livesLeft: number;
  correctAnswers: number;
  wrongAnswers: number;
  xpGained: number;
  result: MatchResult;
}

export interface MatchSummary {
  matchId: string;
  category: string;
  source: "queue" | "room";
  reason: MatchEndReason;
  winnerUid: string | null;
  rounds: number;
  players: MatchPlayerSummary[];
}

export interface VersusStats {
  wins: number;
  losses: number;
  draws: number;
}

export const versusQueryKeys = {
  all: ["versus"] as const,
  stats: () => ["versus", "stats"] as const,
};

export const getVersusStats = async (): Promise<VersusStats> => {
  return httpService.get<VersusStats>("versus/stats");
};
