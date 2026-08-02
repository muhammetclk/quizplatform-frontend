// All TypeScript types for QuizPlatform

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  colorHex?: string;
  orderIndex: number;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  orderIndex: number;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface QuizSummary {
  id: string;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitSec: number;
  questionCount: number;
  createdAt: string;
}

export interface Option {
  id: string;
  content: string;
  orderIndex: number;
}

export interface Question {
  id: string;
  content: string;
  imageUrl?: string;
  difficulty: string;
  orderIndex: number;
  options: Option[];
}

export interface QuizDetail {
  id: string;
  title: string;
  difficulty: string;
  timeLimitSec: number;
  questions: Question[];
}

export interface AnswerItem {
  questionId: string;
  selectedOptionId: string | null;
}

export interface SubmitAttemptRequest {
  quizId: string;
  timeSpentSec: number;
  answers: AnswerItem[];
}

export interface AnswerResult {
  questionId: string;
  questionContent: string;
  selectedOptionId?: string;
  correctOptionId?: string;
  isCorrect: boolean;
  explanation?: string;
  aiExplanation?: string;
}

export interface AttemptResult {
  attemptId: string;
  quizTitle: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  totalQuestions: number;
  timeSpentSec: number;
  answers: AnswerResult[];
}

export interface ExplainedAnswer {
  questionId: string;
  questionContent: string;
  selectedOptionContent: string;
  aiExplanation: string;
}

export interface QuizAiResult {
  quizId: string;
  attemptId: string;
  score: number;
  explanations: ExplainedAnswer[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
