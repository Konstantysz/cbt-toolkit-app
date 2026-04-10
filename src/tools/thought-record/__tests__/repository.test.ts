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

const mockRow = {
  id: 'test-uuid-1234',
  situation: 'Test situation',
  situation_date: '2026-01-01',
  emotions: '[{"name":"Lęk","intensityBefore":70,"intensityAfter":40}]',
  automatic_thoughts: 'Test thoughts',
  evidence_for: 'Evidence for',
  evidence_against: 'Evidence against',
  alternative_thought: 'Alternative',
  outcome: 'Better',
  is_complete: 1,
  is_example: 0,
  current_step: 7,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('createRecord', () => {
  it('inserts into tool_entries and thought_records, returns created record', async () => {
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockRow);

    const result = await repo.createRecord(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('tool_entries'))).toBe(true);
    expect(calls.some((sql) => sql.includes('thought_records'))).toBe(true);
    expect(result.id).toBe('test-uuid-1234');
    expect(result.situation).toBe('Test situation');
    expect(result.emotions).toHaveLength(1);
    expect(result.isComplete).toBe(true);
  });
});

describe('getRecords', () => {
  it('returns mapped ThoughtRecord array', async () => {
    (mockDb.getAllAsync as jest.Mock).mockResolvedValueOnce([
      mockRow,
      { ...mockRow, id: 'other-id' },
    ]);

    const result = await repo.getRecords(mockDb);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('test-uuid-1234');
    expect(result[0].situationDate).toBe('2026-01-01');
    expect(result[0].emotions).toEqual([{ name: 'Lęk', intensityBefore: 70, intensityAfter: 40 }]);
    expect(result[1].id).toBe('other-id');
  });

  it('returns empty array when no records exist', async () => {
    (mockDb.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    const result = await repo.getRecords(mockDb);
    expect(result).toEqual([]);
  });
});

describe('getRecordById', () => {
  it('returns mapped ThoughtRecord when found', async () => {
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockRow);

    const result = await repo.getRecordById(mockDb, 'test-uuid-1234');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('test-uuid-1234');
    expect(result!.isExample).toBe(false);
    expect(result!.currentStep).toBe(7);
  });

  it('returns null when record not found', async () => {
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    const result = await repo.getRecordById(mockDb, 'missing-id');
    expect(result).toBeNull();
  });
});

describe('updateRecord', () => {
  it('updates thought_records fields when thought content provided', async () => {
    await repo.updateRecord(mockDb, 'test-uuid-1234', {
      situation: 'New situation',
      emotions: [{ name: 'Smutek', intensityBefore: 60, intensityAfter: 30 }],
      automaticThoughts: 'New thought',
    });

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('UPDATE thought_records'))).toBe(true);
  });

  it('updates tool_entries fields when isComplete or currentStep provided', async () => {
    await repo.updateRecord(mockDb, 'test-uuid-1234', {
      isComplete: true,
      currentStep: 7,
    });

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('UPDATE tool_entries'))).toBe(true);
  });

  it('updates both tables when both content and status fields provided', async () => {
    await repo.updateRecord(mockDb, 'test-uuid-1234', {
      situation: 'Updated',
      isComplete: true,
    });

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('UPDATE thought_records'))).toBe(true);
    expect(calls.some((sql) => sql.includes('UPDATE tool_entries'))).toBe(true);
  });

  it('makes no DB calls when updates object is empty', async () => {
    await repo.updateRecord(mockDb, 'test-uuid-1234', {});
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });
});

describe('deleteRecord', () => {
  it('deletes from tool_entries by id', async () => {
    await repo.deleteRecord(mockDb, 'test-uuid-1234');

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('tool_entries'))).toBe(true);
    expect((mockDb.runAsync as jest.Mock).mock.calls[0][1]).toContain('test-uuid-1234');
  });
});

describe('insertSeedRecord', () => {
  it('inserts into tool_entries and thought_records with is_example=1', async () => {
    await repo.insertSeedRecord(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('tool_entries'))).toBe(true);
    expect(calls.some((sql) => sql.includes('thought_records'))).toBe(true);
    // Second call inserts with is_example flag
    const thoughtRecordCall = calls.find((sql) => sql.includes('thought_records'));
    expect(thoughtRecordCall).toContain('is_example');
  });
});

describe('deleteAll', () => {
  it('executes DELETE on thought_records and tool_entries', async () => {
    await repo.deleteAll(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('thought_records'))).toBe(
      true
    );
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('tool_entries'))).toBe(true);
  });
});
