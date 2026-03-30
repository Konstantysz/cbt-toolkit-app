import { warmDark } from './palettes/warm-dark';
import { ocean } from './palettes/ocean';

export interface ColorSet {
  bg: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderFocus: string;
  accent: string;
  accentDim: string;
  accentBorder: string;
  text: string;
  textMuted: string;
  textDim: string;
  danger: string;
  dangerDim: string;
  dangerBorder: string;
  success: string;
  successDim: string;
  inProgress: string;
  inProgressDim: string;
  accentSubtle: string;
}

export type PaletteId = 'warm-dark' | 'ocean';

export interface PaletteDefinition {
  id: PaletteId;
  name: string;
  dark: ColorSet;
  darkHighContrast: ColorSet;
  light: ColorSet;
  lightHighContrast: ColorSet;
}

export const PALETTES: Record<PaletteId, PaletteDefinition> = {
  'warm-dark': { id: 'warm-dark', ...warmDark },
  ocean: { id: 'ocean', ...ocean },
};

/** @deprecated Use useColors() instead. Removed in cleanup task. */
export const colors: ColorSet = PALETTES['warm-dark'].dark;
/** @deprecated Use useColors() instead. Removed in cleanup task. */
export const highContrastColors: ColorSet = PALETTES['warm-dark'].darkHighContrast;

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
