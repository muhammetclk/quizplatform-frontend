import api from './axios';
import type {
  ApiResponse,
  CategoryDto,
  TopicDto,
  QuizSummaryDto,
  CreateCategoryRequest,
  CreateTopicRequest,
  CreateQuizRequest,
} from '../types';

export const adminCreateCategory = async (data: CreateCategoryRequest): Promise<CategoryDto> => {
  const res = await api.post<ApiResponse<CategoryDto>>('/api/admin/category', data);
  return res.data.data;
};

export const adminCreateTopic = async (data: CreateTopicRequest): Promise<TopicDto> => {
  const res = await api.post<ApiResponse<TopicDto>>('/api/admin/topic', data);
  return res.data.data;
};

export const adminCreateQuiz = async (data: CreateQuizRequest): Promise<QuizSummaryDto> => {
  const res = await api.post<ApiResponse<QuizSummaryDto>>('/api/admin/quiz', data);
  return res.data.data;
};
