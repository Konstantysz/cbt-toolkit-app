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
