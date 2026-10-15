jest.mock('expo-sqlite');
jest.mock('expo-file-system/legacy', () => ({ readAsStringAsync: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../notifications/permissions', () => ({ hasPermissions: jest.fn() }));
jest.mock('../../notifications/schedule', () => ({ applyReminder: jest.fn() }));

import * as FileSystem from 'expo-file-system/legacy';
import type * as SQLite from 'expo-sqlite';
import { importData } from '../import';
import { hasPermissions } from '../../notifications/permissions';
import { applyReminder } from '../../notifications/schedule';
import { useSettings } from '../../settings/store';

const mockDb = {
  runAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  withTransactionAsync: jest.fn().mockImplementation((fn: () => Promise<void>) => fn()),
} as unknown as SQLite.SQLiteDatabase;

const withSettings = (settings: object) =>
  (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
    JSON.stringify({ version: 1, thoughtRecords: [], behavioralExperiments: [], settings })
  );

beforeEach(() => {
  jest.clearAllMocks();
  useSettings.setState({ reminderEnabled: false, reminderTime: '20:00' });
});

describe('importData reminder settings', () => {
  it('does not enable reminders without permission', async () => {
    (hasPermissions as jest.Mock).mockResolvedValue(false);
    withSettings({ reminderEnabled: true, reminderTime: '07:30' });
    await importData(mockDb, 'file://x');
    expect(useSettings.getState().reminderEnabled).toBe(false);
    expect(useSettings.getState().reminderTime).toBe('07:30');
    expect(applyReminder).not.toHaveBeenCalledWith(true, expect.anything());
  });

  it('enables and schedules with permission, ignoring malformed time', async () => {
    (hasPermissions as jest.Mock).mockResolvedValue(true);
    withSettings({ reminderEnabled: true, reminderTime: '99:99' });
    await importData(mockDb, 'file://x');
    expect(useSettings.getState().reminderEnabled).toBe(true);
    expect(useSettings.getState().reminderTime).toBe('20:00');
    expect(applyReminder).toHaveBeenCalledWith(true, '20:00');
  });
});
