jest.mock('expo-sqlite');

const mockFileWrite = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-file-system', () => ({
  Paths: {
    cache: 'file:///cache/',
  },
  File: jest.fn(() => ({
    uri: 'file:///cache/test.json',
    write: mockFileWrite,
  })),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import { exportData } from '../export';

const mockDb = {
  getAllAsync: jest.fn(),
} as unknown as SQLite.SQLiteDatabase;

const thoughtRows = [{ id: 'tr1', situation: 'Sytuacja', created_at: '2026-01-01T00:00:00.000Z' }];
const experimentRows = [{ id: 'be1', belief: 'Przekonanie', created_at: '2026-01-01T00:00:00.000Z' }];

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.getAllAsync as jest.Mock)
    .mockResolvedValueOnce(thoughtRows)
    .mockResolvedValueOnce(experimentRows);
});

describe('exportData', () => {
  it('writes JSON with correct shape and calls shareAsync', async () => {
    await exportData(mockDb);

    expect(mockFileWrite).toHaveBeenCalledTimes(1);
    const content = (mockFileWrite as jest.Mock).mock.calls[0][0] as string;

    const parsed = JSON.parse(content) as {
      version: number;
      exportedAt: string;
      thoughtRecords: unknown[];
      behavioralExperiments: unknown[];
    };
    expect(parsed.version).toBe(1);
    expect(typeof parsed.exportedAt).toBe('string');
    expect(parsed.thoughtRecords).toEqual(thoughtRows);
    expect(parsed.behavioralExperiments).toEqual(experimentRows);

    expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///cache/test.json', expect.any(Object));
  });
});
