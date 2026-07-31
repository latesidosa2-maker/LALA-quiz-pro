import { api } from './api';
import { AuthUser } from '../types';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('lala_token', data.token);
    localStorage.setItem('lala_user', JSON.stringify(data.user));
    return data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    stream?: 'Natural Science' | 'Social Science'
  ): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password, stream });
    localStorage.setItem('lala_token', data.token);
    localStorage.setItem('lala_user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('lala_token');
    localStorage.removeItem('lala_user');
  },

  getStoredUser: (): AuthUser | null => {
    const raw = localStorage.getItem('lala_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: (): boolean => !!localStorage.getItem('lala_token'),
};
