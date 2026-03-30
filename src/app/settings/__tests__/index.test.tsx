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
    setReminderEnabled: jest.fn(),
    setReminderTime: jest.fn(),
    setFontSize: jest.fn(),
    setReducedMotion: jest.fn(),
    setHighContrast: jest.fn(),
    setPalette: jest.fn(),
    setDarkMode: jest.fn(),
  };
  const useSettings = jest.fn((selector?: (s: typeof state) => unknown) =>
    selector ? selector(state) : state
  );
  return { useSettings };
});
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SettingsScreen from '../index';

describe('SettingsScreen', () => {
  it('renders all 6 section headers', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Powiadomienia')).toBeTruthy();
    expect(screen.getByText('Wygląd')).toBeTruthy();
    expect(screen.getByText('Dostępność')).toBeTruthy();
    expect(screen.getByText('Dane')).toBeTruthy();
    expect(screen.getByText('Zasoby pomocowe')).toBeTruthy();
    expect(screen.getByText('O aplikacji')).toBeTruthy();
  });

  it('hides time row when reminderEnabled is false (default)', () => {
    render(<SettingsScreen />);
    expect(screen.queryByText('Godzina przypomnienia')).toBeNull();
  });

  it('font size selector shows 3 options', () => {
    render(<SettingsScreen />);
    // All three A labels are rendered
    const fontLabels = screen.getAllByText('A');
    expect(fontLabels.length).toBe(3);
  });
});
