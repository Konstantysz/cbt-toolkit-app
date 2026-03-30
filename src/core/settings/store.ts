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
}

interface SettingsActions {
  setReminderEnabled: (value: boolean) => void;
  setReminderTime: (value: string) => void;
  setFontSize: (value: FontSize) => void;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setPalette: (value: PaletteId) => void;
  setDarkMode: (value: boolean) => void;
}

type SettingsState = SettingsData & SettingsActions;

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      reminderEnabled: false,
      reminderTime: '20:00',
      fontSize: 'md' as FontSize,
      reducedMotion: false,
      highContrast: false,
      palette: 'warm-dark' as PaletteId,
      darkMode: true,
      setReminderEnabled: (value) => set({ reminderEnabled: value }),
      setReminderTime: (value) => set({ reminderTime: value }),
      setFontSize: (value) => set({ fontSize: value }),
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setHighContrast: (value) => set({ highContrast: value }),
      setPalette: (value) => set({ palette: value }),
      setDarkMode: (value) => set({ darkMode: value }),
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
      }),
      merge: (persisted, current) =>
        ({
          ...current,
          ...(persisted as Partial<SettingsData>),
        }) as SettingsState,
    }
  )
);
