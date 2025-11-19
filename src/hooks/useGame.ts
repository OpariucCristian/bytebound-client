import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHttp } from "./useHttp";
import type { CheckAnswerDto } from "./useQuestion";

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

// Query Keys
export const gameQueryKeys = {
  all: ["games"] as const,
  byId: (id: string) => ["games", id] as const,
  nextQuestion: (gameId: string) => ["games", gameId, "next-question"] as const,
};

export const useGetNextQuestion = (gameId: string | null) => {
  const http = useHttp();

  return useQuery({
    queryKey: gameQueryKeys.nextQuestion(gameId || ""),
    queryFn: () =>
      http.get<QuestionPoolDto>(`/Games/gameInstance/nextQuestion/${gameId}`),
    enabled: false, // We'll refetch manually
  });
};

export const useGameMutations = () => {
  const http = useHttp();
  const queryClient = useQueryClient();

  const startNewGame = useMutation({
    mutationFn: (data: CreateNewGameDto) =>
      http.post<ReadNewGameDto, CreateNewGameDto>(
        "/Games/gameInstance/new",
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameQueryKeys.all });
    },
  });

  const checkGameAnswer = useMutation({
    mutationFn: ({ gameId, answerId }: { gameId: string; answerId: number }) =>
      http.post<boolean, CheckAnswerDto>(
        `/Games/gameInstance/checkAnswer/${gameId}`,
        { answerId }
      ),
  });

  const timeoutQuestion = useMutation({
    mutationFn: ({ gameId }: { gameId: string }) =>
      http.post<void>(`/Games/gameInstance/timeoutQuestion/${gameId}`),
  });

  const getGameStats = (gameId: string) => useQuery({
    queryKey: gameQueryKeys.byId(gameId),
    queryFn: () =>
      http.get<GameStatsDto>(`/Games/gameInstance/stats/${gameId}`),
  });

  return {
    startNewGame,
    checkGameAnswer,
    timeoutQuestion,
    getGameStats,
  };
};
