import { Enemy } from "./enemyService";
import { httpService } from "./httpService";
import { Player } from "./playerService";

// Game Types
export interface Game {
  id: string;
  createdAt: string;
  updatedAt: string;
  playerId: number;
  levelId: number;
  currentQuestionIndex: number;
  score: number;
  lives: number;
  gameState: string;
  enemy: Enemy;
}

export interface CreateNewGameDto {
  type: string;
  category: string;
  difficulty: number;
}

export interface ReadNewGameDto {
  id: string;
  type: string;
  category: string;
  currentQuestionId: string;
  difficulty: number;
  gameState: string;
  playerId: string;
  firstQuestion?: QuestionPoolDto;
  playerLives: number;
  enemyLives: number;
  enemy: Enemy;
  skills: RunSkill[];
}

/** A skill of the player's hero, with its state in the current run. */
export interface RunSkill {
  id: string;
  /** Stable identifier, e.g. "shields_up"; picks the icon and effects. */
  key: string;
  name: string | null;
  description: string | null;
  unlockAtLvl: number;
  /** The player's level is high enough to use it. */
  unlocked: boolean;
  /** Already spent this run (each skill is usable once per run). */
  used: boolean;
  /** Protecting the current question. */
  active: boolean;
}

export interface QuestionPoolDto {
  id: string;
  text: string;
  category: string;
  difficulty: number;
  answers: AnswerDto[];
  questionSeconds: number;
  isDifficultyChange: boolean;
  enemy: Enemy | null;
  enemyLives?: number;
  playerLives?: number;
}

export interface AnswerDto {
  id: string;
  text: string;
}

/** Outcome of an answer or a timed-out question, as decided by the server. */
export interface AnswerResultDto {
  correct: boolean;
  playerLives: number;
  enemyLives: number;
  gameOver: boolean;
  /** A wrong answer whose damage an active skill blocked. */
  blocked: boolean;
}

export interface GameStatsDto {
  playerId: string;
  gameId: string;
  correctAnswers: number;
  correctAnswersStreakMax: number;
  wrongAnswers: number;
  xpGained: number;
  createdAt: Date;
  player?: Player;
}

// Query Keys
export const gameQueryKeys = {
  all: ["games"] as const,
  byId: (id: string) => ["games", id] as const,
  stats: (gameId: string) => ["games", gameId, "stats"] as const,
};

// Service functions
// Playing a game (start, answers, questions) goes through the game socket,
// see gameSocket.ts.
export const getGameStats = async (gameId: string): Promise<GameStatsDto> => {
  return httpService.get<GameStatsDto>(`games/gameInstance/stats/${gameId}`);
};

export const getScoreboard = async (page: number): Promise<GameStatsDto[]> => {
  return httpService.get<GameStatsDto[]>(`games/scoreboard?page=${page}`);
};
