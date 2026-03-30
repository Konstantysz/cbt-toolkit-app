jest.mock('../../settings/store', () => ({
  useSettings: jest.fn(),
}));

import { useColors } from '../useColors';
import { useSettings } from '../../settings/store';
import { PALETTES } from '../index';

type MockState = {
  palette: 'warm-dark' | 'ocean';
  darkMode: boolean;
  highContrast: boolean;
};

function mockSettings(state: MockState) {
  (useSettings as unknown as jest.Mock).mockImplementation((sel: (s: MockState) => unknown) =>
    sel(state)
  );
}

describe('useColors', () => {
  it('returns warm-dark dark when palette=warm-dark, darkMode=true, highContrast=false', () => {
    mockSettings({ palette: 'warm-dark', darkMode: true, highContrast: false });
    expect(useColors()).toBe(PALETTES['warm-dark'].dark);
  });

  it('returns warm-dark darkHighContrast when palette=warm-dark, darkMode=true, highContrast=true', () => {
    mockSettings({ palette: 'warm-dark', darkMode: true, highContrast: true });
    expect(useColors()).toBe(PALETTES['warm-dark'].darkHighContrast);
  });

  it('returns warm-dark light when palette=warm-dark, darkMode=false, highContrast=false', () => {
    mockSettings({ palette: 'warm-dark', darkMode: false, highContrast: false });
    expect(useColors()).toBe(PALETTES['warm-dark'].light);
  });

  it('returns warm-dark lightHighContrast when palette=warm-dark, darkMode=false, highContrast=true', () => {
    mockSettings({ palette: 'warm-dark', darkMode: false, highContrast: true });
    expect(useColors()).toBe(PALETTES['warm-dark'].lightHighContrast);
  });

  it('returns ocean dark when palette=ocean, darkMode=true, highContrast=false', () => {
    mockSettings({ palette: 'ocean', darkMode: true, highContrast: false });
    expect(useColors()).toBe(PALETTES['ocean'].dark);
  });

  it('returns ocean light when palette=ocean, darkMode=false, highContrast=false', () => {
    mockSettings({ palette: 'ocean', darkMode: false, highContrast: false });
    expect(useColors()).toBe(PALETTES['ocean'].light);
  });
});
