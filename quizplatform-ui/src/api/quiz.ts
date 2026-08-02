import api from './axios';
import type { ApiResponse, Category, Topic, QuizSummary, QuizDetail } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get<ApiResponse<Category[]>>('/api/category');
  return res.data.data;
};

export const getTopics = async (categoryId: string): Promise<Topic[]> => {
  const res = await api.get<ApiResponse<Topic[]>>(`/api/category/${categoryId}/topic`);
  return res.data.data;
};

export const getQuizzes = async (topicId: string): Promise<QuizSummary[]> => {
  const res = await api.get<ApiResponse<QuizSummary[]>>(`/api/topic/${topicId}/quiz`);
  return res.data.data;
};

export const getQuizDetail = async (quizId: string): Promise<QuizDetail> => {
  const res = await api.get<ApiResponse<QuizDetail>>(`/api/quiz/${quizId}`);
  return res.data.data;
};
