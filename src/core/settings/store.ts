import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'sm' | 'md' | 'lg';

export interface SettingsData {
  reminderEnabled: boolean;
  reminderTime: string;
  fontSize: FontSize;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface SettingsActions {
  setReminderEnabled: (value: boolean) => void;
  setReminderTime: (value: string) => void;
  setFontSize: (value: FontSize) => void;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
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
      setReminderEnabled: (value) => set({ reminderEnabled: value }),
      setReminderTime: (value) => set({ reminderTime: value }),
      setFontSize: (value) => set({ fontSize: value }),
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setHighContrast: (value) => set({ highContrast: value }),
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
      }),
      merge: (persisted, current) =>
        ({
          ...current,
          ...(persisted as Partial<SettingsData>),
        }) as SettingsState,
    }
  )
);
