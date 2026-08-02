import api from './axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/auth/register', data);
  return res.data;
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/auth/login', data);
  return res.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};
