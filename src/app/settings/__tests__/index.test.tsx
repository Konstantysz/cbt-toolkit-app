jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn().mockReturnValue({}) }));
jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn(), back: jest.fn() }),
}));
jest.mock('expo-constants', () => ({ default: { expoConfig: { version: '1.0.0' } } }));
jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));
jest.mock('expo-linking', () => ({ openURL: jest.fn(), openSettings: jest.fn() }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../core/settings/store', () => {
  const state = {
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
    setReminderEnabled: jest.fn(),
    setReminderTime: jest.fn(),
    setFontSize: jest.fn(),
    setReducedMotion: jest.fn(),
    setHighContrast: jest.fn(),
    setPalette: jest.fn(),
    setDarkMode: jest.fn(),
    setPinEnabled: jest.fn(),
    setBiometricsEnabled: jest.fn(),
    setPinOnboardingShown: jest.fn(),
  };
  const useSettings = jest.fn((selector?: (s: typeof state) => unknown) =>
    selector ? selector(state) : state
  );
  (useSettings as unknown as { getState: () => typeof state }).getState = () => state;
  return { useSettings, __mockState: state };
});
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('../../../core/auth/pin', () => ({
  clearPin: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../core/auth/store', () => ({
  useAuthStore: { getState: jest.fn().mockReturnValue({ setPhase: jest.fn() }) },
}));

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SettingsScreen from '../index';
import { pl } from '../../../core/i18n/pl';
import * as SettingsStoreMock from '../../../core/settings/store';

describe('SettingsScreen', () => {
  it('renders all 6 section headers', () => {
    render(<SettingsScreen />);
    expect(screen.getByText(pl.settings.notifications.title)).toBeTruthy();
    expect(screen.getByText(pl.settings.appearance.title)).toBeTruthy();
    expect(screen.getByText(pl.settings.accessibility.title)).toBeTruthy();
    expect(screen.getByText(pl.settings.data.title)).toBeTruthy();
    expect(screen.getByText(pl.settings.resources.title)).toBeTruthy();
    expect(screen.getByText(pl.settings.about.title)).toBeTruthy();
  });

  it('hides time row when reminderEnabled is false (default)', () => {
    render(<SettingsScreen />);
    expect(screen.queryByText(pl.settings.notifications.time)).toBeNull();
  });

  it('font size selector shows 3 options', () => {
    render(<SettingsScreen />);
    // All three A labels are rendered
    const fontLabels = screen.getAllByText('A');
    expect(fontLabels.length).toBe(3);
  });
});

describe('SettingsScreen — Prywatność section', () => {
  beforeEach(() => {
    (
      SettingsStoreMock as unknown as { __mockState: { pinEnabled: boolean } }
    ).__mockState.pinEnabled = false;
  });

  it('renders privacy section header', () => {
    render(<SettingsScreen />);
    expect(screen.getByText(pl.settings.privacy.title)).toBeTruthy();
  });

  it('renders PIN toggle', () => {
    render(<SettingsScreen />);
    expect(screen.getByText(pl.settings.privacy.pinEnabled)).toBeTruthy();
  });

  it('does not show "Zmień kod PIN" when pinEnabled is false', () => {
    render(<SettingsScreen />);
    expect(screen.queryByText(pl.settings.privacy.changePin)).toBeNull();
  });

  it('shows "Zmień kod PIN" when pinEnabled is true', () => {
    (
      SettingsStoreMock as unknown as { __mockState: { pinEnabled: boolean } }
    ).__mockState.pinEnabled = true;
    render(<SettingsScreen />);
    expect(screen.getByText(pl.settings.privacy.changePin)).toBeTruthy();
  });
});
