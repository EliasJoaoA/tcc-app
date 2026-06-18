export const Colors = {
  primary: '#4A90D9',
  primaryDark: '#2E6AB0',
  primaryLight: '#A8CBE8',

  secondary: '#6EC6A0',
  secondaryDark: '#4A9E7A',

  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF2F7',

  text: '#1A2233',
  textSecondary: '#5A6778',
  textLight: '#8A95A5',

  border: '#D8DFE8',
  borderLight: '#E8ECF2',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#E53935',
  info: '#2196F3',

  white: '#FFFFFF',
  black: '#000000',

  // Cores para marcadores do mapa
  quietZone: '#4A90D9',
  restPoint: '#6EC6A0',
  building: '#9E9E9E',
  service: '#FF9800',

  // Prioridades
  priorityHigh: '#E53935',
  priorityMedium: '#FF9800',
  priorityLow: '#4CAF50',

  // Alto contraste
  highContrast: {
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#555555',
    primary: '#64B5F6',
  },
} as const;

export const CalmColorSchemes: Record<string, { background: string; surface: string }> = {
  blue: { background: '#E3F2FD', surface: '#BBDEFB' },
  green: { background: '#E8F5E9', surface: '#C8E6C9' },
  purple: { background: '#F3E5F5', surface: '#E1BEE7' },
  warm: { background: '#FFF3E0', surface: '#FFE0B2' },
};
