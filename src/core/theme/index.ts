import { warmDark } from './palettes/warm-dark';
import { ocean } from './palettes/ocean';
import type { PaletteDefinition, PaletteId } from './types';

export type { ColorSet, PaletteDefinition, PaletteId } from './types';

export const PALETTES: Record<PaletteId, PaletteDefinition> = {
  'warm-dark': { id: 'warm-dark', ...warmDark },
  ocean: { id: 'ocean', ...ocean },
};

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
