import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { Mutate } from 'zustand/vanilla';
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

// A widened StoreApi where setState accepts partial data + optional boolean replace.
// This allows tests to call useSettings.setState(DEFAULTS, true) with only data fields;
// the patched setState re-attaches action functions automatically.
type WideSetState = (
  partial:
    | SettingsState
    | Partial<SettingsState>
    | ((state: SettingsState) => SettingsState | Partial<SettingsState>),
  replace?: boolean
) => void;

// Include persist middleware augmentation so useSettings.persist.rehydrate() is typed.
type SettingsStoreApi = Omit<
  Mutate<StoreApi<SettingsState>, [['zustand/persist', unknown]]>,
  'setState'
> & {
  setState: WideSetState;
};

type SettingsStore = UseBoundStore<SettingsStoreApi>;

const ACTIONS: SettingsActions = {
  setReminderEnabled: (value) => useSettings.setState({ reminderEnabled: value }),
  setReminderTime: (value) => useSettings.setState({ reminderTime: value }),
  setFontSize: (value) => useSettings.setState({ fontSize: value }),
  setReducedMotion: (value) => useSettings.setState({ reducedMotion: value }),
  setHighContrast: (value) => useSettings.setState({ highContrast: value }),
};

const _store = create<SettingsState>()(
  persist(
    () =>
      ({
        reminderEnabled: false,
        reminderTime: '20:00',
        fontSize: 'md' as FontSize,
        reducedMotion: false,
        highContrast: false,
        ...ACTIONS,
      }) as SettingsState,
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

// Patch setState so that resetting data (e.g. in tests via setState(DEFAULTS, true))
// always re-attaches actions. Zustand v5's overload 2 requires a full SettingsState
// when replace=true, but we accept partial data here and merge actions back in.
const _origSetState = _store.setState.bind(_store);
(_store as unknown as { setState: WideSetState }).setState = (
  partial:
    | SettingsState
    | Partial<SettingsState>
    | ((state: SettingsState) => SettingsState | Partial<SettingsState>),
  replace?: boolean
) => {
  if (replace === true && typeof partial !== 'function') {
    _origSetState({ ...(partial as Partial<SettingsState>), ...ACTIONS } as SettingsState, true);
  } else {
    _origSetState(
      partial as Parameters<typeof _origSetState>[0],
      replace as Parameters<typeof _origSetState>[1]
    );
  }
};

export const useSettings = _store as unknown as SettingsStore;
