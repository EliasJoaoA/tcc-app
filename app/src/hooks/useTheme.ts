import { useMemo } from 'react';
import { Colors, CalmColorSchemes } from '../constants/colors';
import { FontSizes, type FontSizeKey } from '../constants/typography';
import { usePreferencesStore } from '../store/preferences.store';

export function useTheme() {
  const { preferences } = usePreferencesStore();

  return useMemo(() => {
    const fontSize = FontSizes[preferences.font_size as FontSizeKey];
    const isHighContrast = preferences.high_contrast;
    const calmScheme = preferences.calm_color_scheme
      ? CalmColorSchemes[preferences.calm_color_scheme]
      : null;

    const baseColors = {
      borderLight: Colors.borderLight,
      textLight: Colors.textLight,
    };

    const colors = isHighContrast
      ? {
          ...baseColors,
          background: Colors.highContrast.background,
          surface: Colors.highContrast.surface,
          text: Colors.highContrast.text,
          textSecondary: Colors.highContrast.textSecondary,
          border: Colors.highContrast.border,
          primary: Colors.highContrast.primary,
          primaryDark: Colors.primaryDark,
          primaryLight: Colors.primaryLight,
          error: Colors.error,
          success: Colors.success,
          warning: Colors.warning,
        }
      : {
          ...baseColors,
          background: calmScheme?.background ?? Colors.background,
          surface: calmScheme?.surface ?? Colors.surface,
          text: Colors.text,
          textSecondary: Colors.textSecondary,
          border: Colors.border,
          primary: Colors.primary,
          primaryDark: Colors.primaryDark,
          primaryLight: Colors.primaryLight,
          error: Colors.error,
          success: Colors.success,
          warning: Colors.warning,
        };

    return { colors, fontSize, preferences };
  }, [preferences]);
}
