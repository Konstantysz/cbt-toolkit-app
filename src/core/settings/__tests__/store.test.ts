jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

import { useSettings } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULTS = {
  reminderEnabled: false,
  reminderTime: '20:00',
  fontSize: 'md' as const,
  reducedMotion: false,
  highContrast: false,
  palette: 'warm-dark' as const,
  darkMode: true,
  pinEnabled: false,
  biometricsEnabled: false,
  pinOnboardingShown: false,
};

beforeEach(() => {
  useSettings.setState(DEFAULTS);
});

describe('useSettings — defaults', () => {
  it('has correct default values', () => {
    const s = useSettings.getState();
    expect(s.reminderEnabled).toBe(false);
    expect(s.reminderTime).toBe('20:00');
    expect(s.fontSize).toBe('md');
    expect(s.reducedMotion).toBe(false);
    expect(s.highContrast).toBe(false);
  });

  it('has default palette warm-dark', () => {
    expect(useSettings.getState().palette).toBe('warm-dark');
  });

  it('has default darkMode true', () => {
    expect(useSettings.getState().darkMode).toBe(true);
  });
});

describe('useSettings — setters', () => {
  it('setReminderEnabled updates reminderEnabled', () => {
    useSettings.getState().setReminderEnabled(true);
    expect(useSettings.getState().reminderEnabled).toBe(true);
  });

  it('setReminderTime updates reminderTime', () => {
    useSettings.getState().setReminderTime('08:30');
    expect(useSettings.getState().reminderTime).toBe('08:30');
  });

  it('setFontSize updates fontSize', () => {
    useSettings.getState().setFontSize('lg');
    expect(useSettings.getState().fontSize).toBe('lg');
  });

  it('setReducedMotion updates reducedMotion', () => {
    useSettings.getState().setReducedMotion(true);
    expect(useSettings.getState().reducedMotion).toBe(true);
  });

  it('setHighContrast updates highContrast', () => {
    useSettings.getState().setHighContrast(true);
    expect(useSettings.getState().highContrast).toBe(true);
  });

  it('setPalette updates palette', () => {
    useSettings.getState().setPalette('ocean');
    expect(useSettings.getState().palette).toBe('ocean');
  });

  it('setDarkMode updates darkMode', () => {
    useSettings.getState().setDarkMode(false);
    expect(useSettings.getState().darkMode).toBe(false);
  });
});

describe('useSettings — PIN fields', () => {
  it('has pinEnabled default false', () => {
    expect(useSettings.getState().pinEnabled).toBe(false);
  });

  it('has biometricsEnabled default false', () => {
    expect(useSettings.getState().biometricsEnabled).toBe(false);
  });

  it('has pinOnboardingShown default false', () => {
    expect(useSettings.getState().pinOnboardingShown).toBe(false);
  });

  it('setPinEnabled updates pinEnabled', () => {
    useSettings.getState().setPinEnabled(true);
    expect(useSettings.getState().pinEnabled).toBe(true);
  });

  it('setBiometricsEnabled updates biometricsEnabled', () => {
    useSettings.getState().setBiometricsEnabled(true);
    expect(useSettings.getState().biometricsEnabled).toBe(true);
  });

  it('setPinOnboardingShown updates pinOnboardingShown', () => {
    useSettings.getState().setPinOnboardingShown(true);
    expect(useSettings.getState().pinOnboardingShown).toBe(true);
  });

  it('reset restores all fields to defaults', () => {
    useSettings.getState().setPinEnabled(true);
    useSettings.getState().setBiometricsEnabled(true);
    useSettings.getState().setPinOnboardingShown(true);
    useSettings.getState().setDarkMode(false);
    useSettings.getState().reset();
    const s = useSettings.getState();
    expect(s.pinEnabled).toBe(false);
    expect(s.biometricsEnabled).toBe(false);
    expect(s.pinOnboardingShown).toBe(false);
    expect(s.darkMode).toBe(true);
    expect(s.palette).toBe('warm-dark');
  });
});

describe('useSettings — persist rehydration', () => {
  it('rehydrates state from AsyncStorage', async () => {
    const stored = {
      state: {
        reminderEnabled: true,
        reminderTime: '09:00',
        fontSize: 'lg',
        reducedMotion: true,
        highContrast: true,
        palette: 'ocean',
        darkMode: false,
      },
      version: 0,
    };
    jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(stored));

    await useSettings.persist.rehydrate();

    const s = useSettings.getState();
    expect(s.reminderEnabled).toBe(true);
    expect(s.reminderTime).toBe('09:00');
    expect(s.fontSize).toBe('lg');
    expect(s.reducedMotion).toBe(true);
    expect(s.highContrast).toBe(true);
    expect(s.palette).toBe('ocean');
    expect(s.darkMode).toBe(false);
  });
});
