import { httpService } from './httpService';

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
}

export interface QuestionPoolDto {
  id: string;
  text: string;
  category: string;
  difficulty: number;
  answers: AnswerDto[];
  questionSeconds: number;
  isDifficultyChange: boolean;
}

export interface AnswerDto {
  id: number;
  text: string;
}

export interface GameStatsDto {
  correctAnswers: number;
  correctAnswersStreak: number;
  correctAnswersMaxStreak: number;
  wrongAnswers: number;
  xpGained: number;
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
export const startNewGame = async (data: CreateNewGameDto): Promise<ReadNewGameDto> => {
  return httpService.post<ReadNewGameDto, CreateNewGameDto>('Games/gameInstance/new', data);
};

export const checkGameAnswer = async (gameId: string, answerId: number): Promise<boolean> => {
  return httpService.post<boolean, CheckAnswerDto>(`Games/gameInstance/checkAnswer/${gameId}`, { answerId });
};

export const timeoutQuestion = async (gameId: string): Promise<void> => {
  return httpService.post<void>(`Games/gameInstance/timeoutQuestion/${gameId}`);
};

export const getNextQuestion = async (gameId: string): Promise<QuestionPoolDto> => {
  return httpService.get<QuestionPoolDto>(`Games/gameInstance/nextQuestion/${gameId}`);
};

export const getGameStats = async (gameId: string): Promise<GameStatsDto> => {
  return httpService.get<GameStatsDto>(`Games/gameInstance/stats/${gameId}`);
};
