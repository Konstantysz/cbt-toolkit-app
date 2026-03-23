jest.mock('expo-sqlite');
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-1234',
}));

import * as SQLite from 'expo-sqlite';
import * as repo from '../repository';

const mockDb = {
  runAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
} as unknown as SQLite.SQLiteDatabase;

beforeEach(() => jest.clearAllMocks());

describe('deleteAll', () => {
  it('executes DELETE on thought_records and tool_entries', async () => {
    await repo.deleteAll(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map(
      (c: unknown[]) => c[0] as string
    );
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('thought_records'))).toBe(true);
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('tool_entries'))).toBe(true);
  });
});
