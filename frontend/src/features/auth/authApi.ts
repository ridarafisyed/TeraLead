import { apiRequest } from '@/lib/api';
import type { AuthResponse } from './types';

export function register(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: payload });
}

export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: payload });
}
