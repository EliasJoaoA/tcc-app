import { create } from 'zustand';
import type { User } from '../services/auth.service';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { tokenStorage } from '../services/token-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; course?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await authService.login({ email, password });
    const { token, user } = res.data.data;
    await tokenStorage.set(token);
    set({ token, user, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await authService.register(data);
    const { token, user } = res.data.data;
    await tokenStorage.set(token);
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    try { await authService.logout(); } catch {}
    await tokenStorage.remove();
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadToken: async () => {
    const token = await tokenStorage.get();
    if (token) {
      try {
        const res = await userService.getProfile();
        set({ token, user: res.data.data, isAuthenticated: true, isLoading: false });
      } catch {
        await tokenStorage.remove();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    const res = await userService.getProfile();
    set({ user: res.data.data });
  },

  setUser: (user) => set({ user }),
}));
