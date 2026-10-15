import { PALETTES, type ColorSet } from '../index';

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT_KEYS: (keyof ColorSet)[] = [
  'text',
  'textMuted',
  'textDim',
  'accent',
  'danger',
  'success',
  'inProgress',
];
const UI_KEYS: (keyof ColorSet)[] = ['border', 'borderFocus'];
const BACKGROUNDS: (keyof ColorSet)[] = ['bg', 'surface', 'surfaceRaised'];

describe('contrastRatio', () => {
  it('matches WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 1);
  });
});

describe('palette contrast (WCAG AA)', () => {
  Object.values(PALETTES).forEach((palette) => {
    (['dark', 'darkHighContrast', 'light', 'lightHighContrast'] as const).forEach((variant) => {
      const set = palette[variant];
      BACKGROUNDS.forEach((bgKey) => {
        TEXT_KEYS.forEach((key) => {
          it(`${palette.id}/${variant}: ${key} on ${bgKey} >= 4.5`, () => {
            expect(contrastRatio(set[key], set[bgKey])).toBeGreaterThanOrEqual(4.5);
          });
        });
        UI_KEYS.forEach((key) => {
          it(`${palette.id}/${variant}: ${key} on ${bgKey} >= 3`, () => {
            expect(contrastRatio(set[key], set[bgKey])).toBeGreaterThanOrEqual(3);
          });
        });
      });
    });
  });
});
