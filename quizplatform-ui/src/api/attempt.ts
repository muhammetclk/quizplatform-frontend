import api from './axios';
import type { ApiResponse, AttemptResult, SubmitAttemptRequest } from '../types';

export const submitAttempt = async (data: SubmitAttemptRequest): Promise<AttemptResult> => {
  const res = await api.post<ApiResponse<AttemptResult>>('/api/attempt', data);
  return res.data.data;
};
