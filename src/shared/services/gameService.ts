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
  enemy: Enemy;
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
  id: number;
  text: string;
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

interface CheckAnswerDto {
  answerId: number;
}

// Query Keys
export const gameQueryKeys = {
  all: ["games"] as const,
  byId: (id: string) => ["games", id] as const,
  nextQuestion: (gameId: string) => ["games", gameId, "next-question"] as const,
  stats: (gameId: string) => ["games", gameId, "stats"] as const,
};

// Service functions
export const startNewGame = async (
  data: CreateNewGameDto,
): Promise<ReadNewGameDto> => {
  return httpService.post<ReadNewGameDto, CreateNewGameDto>(
    "games/gameInstance/new",
    data,
  );
};

export const checkGameAnswer = async (
  gameId: string,
  answerId: number,
): Promise<boolean> => {
  return httpService.post<boolean, CheckAnswerDto>(
    `games/gameInstance/checkAnswer/${gameId}`,
    { answerId },
  );
};

export const timeoutQuestion = async (gameId: string): Promise<void> => {
  return httpService.post<void>(`games/gameInstance/timeoutQuestion/${gameId}`);
};

export const getNextQuestion = async (
  gameId: string,
): Promise<QuestionPoolDto> => {
  return httpService.get<QuestionPoolDto>(
    `games/gameInstance/nextQuestion/${gameId}`,
  );
};

export const getGameStats = async (gameId: string): Promise<GameStatsDto> => {
  return httpService.get<GameStatsDto>(`games/gameInstance/stats/${gameId}`);
};

export const getScoreboard = async (page: number): Promise<GameStatsDto[]> => {
  return httpService.get<GameStatsDto[]>(`games/scoreboard?page=${page}`);
};
