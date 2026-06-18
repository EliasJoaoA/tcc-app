import api from './api';
import type { User, UserPreferences } from './auth.service';

export const userService = {
  getProfile: () =>
    api.get<{ data: User }>('/user/profile'),

  updateProfile: (data: { name?: string; email?: string; course?: string; support_contact_name?: string; support_contact_phone?: string }) =>
    api.put<{ data: User }>('/user/profile', data),

  updatePreferences: (data: Partial<UserPreferences>) =>
    api.put('/user/preferences', data),

  updateAvatar: (formData: FormData) =>
    api.put('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteAccount: (password: string) =>
    api.delete('/user/account', { data: { password } }),
};
