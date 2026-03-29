export const colors = {
  bg: '#0C0B09',
  surface: '#161510',
  surfaceRaised: '#1E1C17',
  border: '#2C2920',
  borderFocus: '#4A4438',
  accent: '#C4956A',
  accentDim: 'rgba(196,149,106,0.13)',
  accentBorder: 'rgba(196,149,106,0.25)',
  text: '#EDE5D8',
  textMuted: '#8C8276',
  textDim: '#4A453E',
  danger: '#C4605A',
  dangerDim: 'rgba(196,96,90,0.12)',
  success: '#7A9E7E',
  inProgress: '#B8974A',
} as const;

export const highContrastColors = {
  bg: '#000000',
  surface: '#0D0D0D',
  surfaceRaised: '#1A1A1A',
  border: '#5C5650',
  borderFocus: '#8C8276',
  accent: '#C4956A',
  accentDim: 'rgba(196,149,106,0.20)',
  accentBorder: 'rgba(196,149,106,0.40)',
  text: '#FFFFFF',
  textMuted: '#B0A898',
  textDim: '#6B6560',
  danger: '#E8706A',
  dangerDim: 'rgba(232,112,106,0.20)',
  success: '#8BBF90',
  inProgress: '#D4AF6A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const iconRow = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 6,
};

export const typography = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;
