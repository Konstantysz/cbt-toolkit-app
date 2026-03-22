import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'sm' | 'md' | 'lg';

interface SettingsData {
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

const ACTIONS: SettingsActions = {
  setReminderEnabled: (value) => useSettings.setState({ reminderEnabled: value }),
  setReminderTime: (value) => useSettings.setState({ reminderTime: value }),
  setFontSize: (value) => useSettings.setState({ fontSize: value }),
  setReducedMotion: (value) => useSettings.setState({ reducedMotion: value }),
  setHighContrast: (value) => useSettings.setState({ highContrast: value }),
};

export const useSettings = create<SettingsState>()(
  persist(
    () => ({
      reminderEnabled: false,
      reminderTime: '20:00',
      fontSize: 'md' as FontSize,
      reducedMotion: false,
      highContrast: false,
      ...ACTIONS,
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
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SettingsData>),
      }),
    }
  )
);

// Patch setState so that resetting data (e.g. in tests) always re-attaches actions.
const _origSetState = useSettings.setState.bind(useSettings);
useSettings.setState = (
  partial: Parameters<typeof _origSetState>[0],
  replace?: Parameters<typeof _origSetState>[1],
) => {
  if (replace) {
    _origSetState({ ...(partial as object), ...ACTIONS } as SettingsState, replace);
  } else {
    _origSetState(partial, replace);
  }
};
