import { PALETTES, type PaletteId } from '../index';

const PALETTE_IDS: PaletteId[] = ['warm-dark', 'ocean'];
const VARIANT_KEYS = ['dark', 'darkHighContrast', 'light', 'lightHighContrast'] as const;
const COLOR_KEYS = [
  'bg',
  'surface',
  'surfaceRaised',
  'border',
  'borderFocus',
  'accent',
  'accentDim',
  'accentBorder',
  'text',
  'textMuted',
  'textDim',
  'danger',
  'dangerDim',
  'dangerBorder',
  'success',
  'successDim',
  'inProgress',
  'inProgressDim',
  'accentSubtle',
] as const;

describe('PALETTES registry', () => {
  it('contains all expected palette IDs', () => {
    expect(Object.keys(PALETTES)).toEqual(expect.arrayContaining(PALETTE_IDS));
  });

  PALETTE_IDS.forEach((id) => {
    describe(`palette: ${id}`, () => {
      VARIANT_KEYS.forEach((variant) => {
        it(`${variant} contains all ColorSet keys`, () => {
          const colorSet = PALETTES[id][variant];
          COLOR_KEYS.forEach((key) => {
            expect(colorSet).toHaveProperty(key);
            expect(typeof colorSet[key]).toBe('string');
          });
        });
      });
    });
  });

  it('warm-dark.dark.accent equals #C4956A', () => {
    expect(PALETTES['warm-dark'].dark.accent).toBe('#C4956A');
  });
});
