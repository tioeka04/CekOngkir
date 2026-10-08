import type { LoginInput, LoginResponse, RegisterInput, User } from '../types/api';
import { request } from './client';

export function register(input: RegisterInput): Promise<{ message: string }> {
  return request('/auth/register', { method: 'POST', body: input, authenticated: false });
}

export function login(input: LoginInput): Promise<LoginResponse> {
  return request('/auth/login', { method: 'POST', body: input, authenticated: false });
}

export async function fetchCurrentUser(): Promise<User> {
  const { user } = await request<{ user: User }>('/auth/me');
  return user;
}
