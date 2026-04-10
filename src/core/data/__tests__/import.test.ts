jest.mock('expo-sqlite');
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));
jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(),
}));
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'import-uuid-1234',
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import { importData, validateExportFile } from '../import';

const mockDb = {
  runAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  withTransactionAsync: jest.fn().mockImplementation((fn: () => Promise<void>) => fn()),
} as unknown as SQLite.SQLiteDatabase;

beforeEach(() => jest.clearAllMocks());

const validFile = {
  version: 1,
  exportedAt: '2026-01-01T00:00:00.000Z',
  thoughtRecords: [{ id: 'tr1', situation: 'Sytuacja', createdAt: '2026-01-01T00:00:00.000Z' }],
  behavioralExperiments: [
    { id: 'be1', belief: 'Przekonanie', createdAt: '2026-01-01T00:00:00.000Z' },
  ],
};

describe('validateExportFile', () => {
  it('returns null for valid file', () => {
    expect(validateExportFile(validFile)).toBeNull();
  });

  it('rejects null', () => {
    expect(validateExportFile(null)).not.toBeNull();
  });

  it('rejects wrong version', () => {
    expect(validateExportFile({ ...validFile, version: 2 })).not.toBeNull();
  });

  it('rejects missing thoughtRecords', () => {
    const { thoughtRecords: _, ...rest } = validFile;
    expect(validateExportFile(rest)).not.toBeNull();
  });

  it('rejects missing behavioralExperiments', () => {
    const { behavioralExperiments: _, ...rest } = validFile;
    expect(validateExportFile(rest)).not.toBeNull();
  });

  it('rejects thought record missing id', () => {
    const bad = {
      ...validFile,
      thoughtRecords: [{ situation: 'x', createdAt: '2026-01-01T00:00:00.000Z' }],
    };
    expect(validateExportFile(bad)).not.toBeNull();
  });

  it('rejects experiment missing belief', () => {
    const bad = {
      ...validFile,
      behavioralExperiments: [{ id: 'x', createdAt: '2026-01-01T00:00:00.000Z' }],
    };
    expect(validateExportFile(bad)).not.toBeNull();
  });

  it('rejects total count > 5000', () => {
    const big = {
      ...validFile,
      thoughtRecords: Array.from({ length: 5001 }, (_, i) => ({
        id: `tr${i}`,
        situation: 'x',
        createdAt: '2026-01-01T00:00:00.000Z',
      })),
    };
    expect(validateExportFile(big)).not.toBeNull();
  });

  it('accepts file without abcEntries (backward compat)', () => {
    expect(validateExportFile(validFile)).toBeNull();
  });

  it('accepts file with valid abcEntries array', () => {
    const withAbc = {
      ...validFile,
      abcEntries: [{ id: 'abc1', situation: 'x', createdAt: '2026-01-01T00:00:00.000Z' }],
    };
    expect(validateExportFile(withAbc)).toBeNull();
  });

  it('rejects non-array abcEntries', () => {
    const bad = { ...validFile, abcEntries: 'not-an-array' };
    expect(validateExportFile(bad)).not.toBeNull();
  });
});

describe('importData', () => {
  it('inserts records and returns imported/skipped counts', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(validFile));

    const result = await importData(mockDb, 'file:///test.json');

    expect(result.imported).toBe(2); // 1 thought record + 1 experiment
    expect(result.skipped).toBe(0);
    expect(
      (mockDb.runAsync as jest.Mock).mock.calls.filter((c: unknown[]) =>
        (c[0] as string).includes('tool_entries')
      ).length
    ).toBeGreaterThanOrEqual(2);
  });

  it('skips records with duplicate ids', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(validFile));
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValue({ id: 'exists' });

    const result = await importData(mockDb, 'file:///test.json');
    expect(result.skipped).toBe(2);
    expect(result.imported).toBe(0);
  });

  it('throws on invalid JSON', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce('not json {{{');
    await expect(importData(mockDb, 'file:///bad.json')).rejects.toThrow();
  });

  it('throws with human-readable Polish message on validation failure', async () => {
    const invalidFile = { version: 99, thoughtRecords: [], behavioralExperiments: [] };
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(invalidFile));
    await expect(importData(mockDb, 'file:///bad.json')).rejects.toThrow('Nieznana wersja pliku');
  });

  it('imports abc entries when present', async () => {
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValue(null);
    const fileWithAbc = {
      ...validFile,
      abcEntries: [{ id: 'abc1', situation: 'Sytuacja', createdAt: '2026-01-01T00:00:00.000Z' }],
    };
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(fileWithAbc));

    const result = await importData(mockDb, 'file:///test.json');

    expect(result.imported).toBe(3); // 1 thought + 1 experiment + 1 abc
    expect(result.skipped).toBe(0);
    const calls = (mockDb.runAsync as jest.Mock).mock.calls as unknown[][];
    const abcInsert = calls.find((c) => (c[0] as string).includes('abc-model'));
    expect(abcInsert).toBeDefined();
  });

  it('imports successfully without abcEntries (backward compat)', async () => {
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValue(null);
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(validFile));

    const result = await importData(mockDb, 'file:///test.json');
    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(0);
  });
});
