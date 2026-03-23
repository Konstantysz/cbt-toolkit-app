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
  });
});
