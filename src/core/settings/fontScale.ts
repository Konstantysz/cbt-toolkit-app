import type { FontSize } from './store';

const MULTIPLIERS: Record<FontSize, number> = {
  sm: 0.875,
  md: 1.0,
  lg: 1.2,
};

export function scaledFont(base: number, size: FontSize): number {
  return base * MULTIPLIERS[size];
}
