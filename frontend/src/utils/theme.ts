// src/utils/theme.ts
export const Colors = {
  primary: '#6C63FF',       // violet moderne
  primaryDark: '#5A52D5',
  primaryLight: '#EEF0FF',
  secondary: '#FF6584',     // rose accent
  accent: '#43E97B',        // vert succès
  accentBlue: '#38F9D7',
  warning: '#FFB347',
  danger: '#FF4757',
  dangerLight: '#FFF0F1',

  // Backgrounds
  bgDark: '#1a1a2e',
  bgMedium: '#16213e',
  bgCard: '#0f3460',
  bgLight: '#F8F9FF',
  bgWhite: '#FFFFFF',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',
  textMuted: '#D1D5DB',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Status
  statusPending: '#FFB347',
  statusConfirmed: '#43E97B',
  statusCancelled: '#FF4757',
  statusCompleted: '#6C63FF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
};
