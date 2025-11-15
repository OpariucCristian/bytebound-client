import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHttp } from './useHttp';

// Question Types
export interface Question {
  id: string;
  createdAt: string;
  text: string | null;
  category: string | null;
  difficulty: number | null;
  answers: QuestionAnswer[];
}

export interface QuestionAnswer {
  id: number;
  text: string | null;
}

export interface CreateQuestionDto {
  text: string | null;
  category: string | null;
  difficulty: number | null;
  answers: CreateQuestionAnswerDto[];
}

export interface CreateQuestionAnswerDto {
  text: string | null;
  isCorrect: boolean | null;
}

export interface UpdateQuestionDto {
  text?: string | null;
  category?: string | null;
  difficulty?: number | null;
}

export interface CheckAnswerDto {
  answerId: number;
}

export interface CheckAnswerResultDto {
  isCorrect: boolean;
}

// Query Keys
export const questionQueryKeys = {
  all: ['questions'] as const,
  byId: (id: string) => ['questions', id] as const,
  byCategory: (category: string) => ['questions', 'category', category] as const,
  byDifficulty: (difficulty: number) => ['questions', 'difficulty', difficulty] as const,
};

export const useAllQuestions = () => {
  const http = useHttp();
  
  return useQuery({
    queryKey: questionQueryKeys.all,
    queryFn: () => http.get<Question[]>('/questions'),
  });
};

export const useQuestion = (id: string) => {
  const http = useHttp();
  
  return useQuery({
    queryKey: questionQueryKeys.byId(id),
    queryFn: () => http.get<Question>(`/questions/${id}`),
    enabled: !!id,
  });
};

export const useQuestionsByCategory = (category: string) => {
  const http = useHttp();
  
  return useQuery({
    queryKey: questionQueryKeys.byCategory(category),
    queryFn: () => http.get<Question[]>(`/questions/category/${category}`),
    enabled: !!category,
  });
};

export const useQuestionsByDifficulty = (difficulty: number) => {
  const http = useHttp();
  
  return useQuery({
    queryKey: questionQueryKeys.byDifficulty(difficulty),
    queryFn: () => http.get<Question[]>(`/questions/difficulty/${difficulty}`),
    enabled: difficulty !== undefined,
  });
};

export const useQuestionMutations = () => {
  const http = useHttp();
  const queryClient = useQueryClient();
  
  const createQuestion = useMutation({
    mutationFn: (data: CreateQuestionDto) => http.post<Question, CreateQuestionDto>('/questions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKeys.all });
    },
  });
  
  const updateQuestion = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionDto }) =>
      http.put<void, UpdateQuestionDto>(`/questions/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: questionQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: questionQueryKeys.byId(variables.id) });
    },
  });
  
  const deleteQuestion = useMutation({
    mutationFn: (id: string) => http.delete<void>(`/questions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKeys.all });
    },
  });
  
  const checkAnswer = useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: CheckAnswerDto }) =>
      http.post<CheckAnswerResultDto, CheckAnswerDto>(`/questions/${questionId}/check-answer`, data),
  });
  
  return {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    checkAnswer,
  };
};
