import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  course?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  course: string | null;
  avatar: string | null;
  support_contact_name: string | null;
  support_contact_phone: string | null;
  preferences: UserPreferences | null;
  created_at: string;
}

export interface UserPreferences {
  font_size: 'small' | 'medium' | 'large';
  high_contrast: boolean;
  calm_color_scheme: string | null;
  auto_captions: boolean;
  reduce_animations: boolean;
  notifications_enabled: boolean;
  notifications_deadline_hours: number;
}

export const authService = {
  login: (data: LoginData) =>
    api.post<{ data: { token: string; user: User } }>('/auth/login', data),

  register: (data: RegisterData) =>
    api.post<{ data: { token: string; user: User } }>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/auth/reset-password', data),
};
