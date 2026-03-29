jest.mock('expo-sqlite');
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-abc-uuid',
}));

import * as SQLite from 'expo-sqlite';
import * as repo from '../repository';

const mockDb = {
  runAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  withTransactionAsync: jest.fn().mockImplementation((cb: () => Promise<void>) => cb()),
} as unknown as SQLite.SQLiteDatabase;

beforeEach(() => jest.clearAllMocks());

describe('createEntry', () => {
  it('inserts into tool_entries and abc_entries', async () => {
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValueOnce({
      id: 'test-abc-uuid',
      situation: '',
      thoughts: '',
      behaviors: '',
      emotions: '',
      physical_symptoms: '',
      is_example: 0,
      is_complete: 0,
      current_step: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });

    await repo.createEntry(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('tool_entries'))).toBe(true);
    expect(calls.some((sql) => sql.includes('abc_entries'))).toBe(true);
  });
});

describe('deleteEntry', () => {
  it('deletes from tool_entries (cascade handles abc_entries)', async () => {
    await repo.deleteEntry(mockDb, 'some-id');

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('tool_entries'))).toBe(true);
  });
});

describe('deleteAll', () => {
  it('deletes all abc-model entries from tool_entries', async () => {
    await repo.deleteAll(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('abc-model'))).toBe(true);
  });
});

const mockRow = {
  id: 'test-abc-uuid',
  situation: 'Test situation',
  thoughts: 'Test thoughts',
  behaviors: 'Test behaviors',
  emotions: 'Test emotions',
  physical_symptoms: 'Test symptoms',
  is_example: 0,
  is_complete: 1,
  current_step: 2,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('getEntries', () => {
  it('returns mapped AbcEntry array', async () => {
    (mockDb.getAllAsync as jest.Mock).mockResolvedValueOnce([mockRow]);

    const result = await repo.getEntries(mockDb);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-abc-uuid');
    expect(result[0].situation).toBe('Test situation');
    expect(result[0].isComplete).toBe(true);
    expect(result[0].currentStep).toBe(2);
  });

  it('returns empty array when no entries', async () => {
    (mockDb.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    const result = await repo.getEntries(mockDb);
    expect(result).toEqual([]);
  });
});

describe('updateEntry', () => {
  it('updates abc_entries when content fields provided', async () => {
    await repo.updateEntry(mockDb, 'test-abc-uuid', {
      situation: 'New situation',
      thoughts: 'New thoughts',
    });

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('UPDATE abc_entries'))).toBe(true);
  });

  it('updates tool_entries when isComplete or currentStep provided', async () => {
    await repo.updateEntry(mockDb, 'test-abc-uuid', {
      isComplete: true,
      currentStep: 2,
    });

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('UPDATE tool_entries'))).toBe(true);
  });

  it('updates both tables when both content and status fields provided', async () => {
    await repo.updateEntry(mockDb, 'test-abc-uuid', {
      situation: 'Updated',
      isComplete: false,
    });

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('UPDATE abc_entries'))).toBe(true);
    expect(calls.some((sql) => sql.includes('UPDATE tool_entries'))).toBe(true);
  });

  it('makes no DB calls when updates object is empty', async () => {
    await repo.updateEntry(mockDb, 'test-abc-uuid', {});
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });
});

describe('insertSeedEntry', () => {
  it('inserts into tool_entries and abc_entries with is_example=1', async () => {
    await repo.insertSeedEntry(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('tool_entries'))).toBe(true);
    const abcCall = calls.find((sql) => sql.includes('abc_entries'));
    expect(abcCall).toContain('is_example');
  });
});
