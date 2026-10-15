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
  dark: ColorSet;
  darkHighContrast: ColorSet;
  light: ColorSet;
  lightHighContrast: ColorSet;
}
