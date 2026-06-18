export const FontSizes = {
  small: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 22,
    '3xl': 26,
  },
  medium: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 32,
  },
  large: {
    xs: 14,
    sm: 16,
    base: 18,
    lg: 22,
    xl: 26,
    '2xl': 34,
    '3xl': 40,
  },
} as const;

export type FontSizeKey = keyof typeof FontSizes;
