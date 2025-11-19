import { httpService } from './httpService';

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

// Service functions
export const getAllQuestions = async (): Promise<Question[]> => {
  return httpService.get<Question[]>('questions');
};

export const getQuestionById = async (id: string): Promise<Question> => {
  return httpService.get<Question>(`questions/${id}`);
};

export const getQuestionsByCategory = async (category: string): Promise<Question[]> => {
  return httpService.get<Question[]>(`questions/category/${category}`);
};

export const getQuestionsByDifficulty = async (difficulty: number): Promise<Question[]> => {
  return httpService.get<Question[]>(`questions/difficulty/${difficulty}`);
};

export const createQuestion = async (data: CreateQuestionDto): Promise<Question> => {
  return httpService.post<Question, CreateQuestionDto>('questions', data);
};

export const updateQuestion = async (id: string, data: UpdateQuestionDto): Promise<void> => {
  return httpService.put<void, UpdateQuestionDto>(`questions/${id}`, data);
};

export const deleteQuestion = async (id: string): Promise<void> => {
  return httpService.delete<void>(`questions/${id}`);
};

export const checkAnswer = async (questionId: string, data: CheckAnswerDto): Promise<CheckAnswerResultDto> => {
  return httpService.post<CheckAnswerResultDto, CheckAnswerDto>(`questions/${questionId}/check-answer`, data);
};
