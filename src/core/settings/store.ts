import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PaletteId } from '../theme/index';

export type FontSize = 'sm' | 'md' | 'lg';

export interface SettingsData {
  reminderEnabled: boolean;
  reminderTime: string;
  fontSize: FontSize;
  reducedMotion: boolean;
  highContrast: boolean;
  palette: PaletteId;
  darkMode: boolean;
  pinEnabled: boolean;
  biometricsEnabled: boolean;
  pinOnboardingShown: boolean;
}

const SETTINGS_DEFAULTS: SettingsData = {
  reminderEnabled: false,
  reminderTime: '20:00',
  fontSize: 'md',
  reducedMotion: false,
  highContrast: false,
  palette: 'warm-dark',
  darkMode: true,
  pinEnabled: false,
  biometricsEnabled: false,
  pinOnboardingShown: false,
};

interface SettingsActions {
  setReminderEnabled: (value: boolean) => void;
  setReminderTime: (value: string) => void;
  setFontSize: (value: FontSize) => void;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setPalette: (value: PaletteId) => void;
  setDarkMode: (value: boolean) => void;
  setPinEnabled: (value: boolean) => void;
  setBiometricsEnabled: (value: boolean) => void;
  setPinOnboardingShown: (value: boolean) => void;
  reset: () => void;
}

type SettingsState = SettingsData & SettingsActions;

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...SETTINGS_DEFAULTS,
      setReminderEnabled: (value) => set({ reminderEnabled: value }),
      setReminderTime: (value) => set({ reminderTime: value }),
      setFontSize: (value) => set({ fontSize: value }),
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setHighContrast: (value) => set({ highContrast: value }),
      setPalette: (value) => set({ palette: value }),
      setDarkMode: (value) => set({ darkMode: value }),
      setPinEnabled: (value) => set({ pinEnabled: value }),
      setBiometricsEnabled: (value) => set({ biometricsEnabled: value }),
      setPinOnboardingShown: (value) => set({ pinOnboardingShown: value }),
      reset: () => set({ ...SETTINGS_DEFAULTS }),
    }),
    {
      name: 'cbt-toolkit-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reminderEnabled: state.reminderEnabled,
        reminderTime: state.reminderTime,
        fontSize: state.fontSize,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        palette: state.palette,
        darkMode: state.darkMode,
        pinEnabled: state.pinEnabled,
        biometricsEnabled: state.biometricsEnabled,
        pinOnboardingShown: state.pinOnboardingShown,
      }),
      merge: (persisted, current) =>
        ({
          ...current,
          ...(persisted as Partial<SettingsData>),
        }) as SettingsState,
    }
  )
);
