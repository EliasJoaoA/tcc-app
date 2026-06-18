import { create } from 'zustand';
import type { UserPreferences } from '../services/auth.service';
import { userService } from '../services/user.service';

interface PreferencesState {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  font_size: 'medium',
  high_contrast: false,
  calm_color_scheme: null,
  auto_captions: false,
  reduce_animations: false,
  notifications_enabled: true,
  notifications_deadline_hours: 24,
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: defaultPreferences,

  setPreferences: (prefs) => set({ preferences: prefs }),

  updatePreference: async (key, value) => {
    set({ preferences: { ...get().preferences, [key]: value } });
    await userService.updatePreferences({ [key]: value });
  },
}));
