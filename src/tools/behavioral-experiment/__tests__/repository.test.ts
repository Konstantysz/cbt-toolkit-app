import * as SQLite from 'expo-sqlite';

// Mock expo-sqlite and expo-crypto (same pattern as thought-record tests)
jest.mock('expo-sqlite');
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-1234',
}));

import * as repo from '../repository';

const mockDb = {
  runAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
} as unknown as SQLite.SQLiteDatabase;

beforeEach(() => jest.clearAllMocks());

describe('createExperiment', () => {
  it('inserts into tool_entries and behavioral_experiments, returns record', async () => {
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValueOnce({
      id: 'test-uuid-1234',
      status: 'planned',
      belief: '',
      belief_strength_before: 50,
      alternative_belief: '',
      plan: '',
      predicted_outcome: '',
      execution_date: null,
      execution_notes: null,
      actual_outcome: null,
      conclusion: null,
      belief_strength_after: null,
      is_example: 0,
      is_complete: 0,
      current_step: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });

    const result = await repo.createExperiment(mockDb);

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
    expect(result.id).toBe('test-uuid-1234');
    expect(result.status).toBe('planned');
  });
});

describe('getExperiments', () => {
  it('returns mapped array from JOIN query', async () => {
    (mockDb.getAllAsync as jest.Mock).mockResolvedValueOnce([
      {
        id: 'abc',
        status: 'completed',
        belief: 'Test belief',
        belief_strength_before: 80,
        alternative_belief: '',
        plan: '',
        predicted_outcome: '',
        execution_date: '2026-01-05',
        execution_notes: 'Did it',
        actual_outcome: 'Fine',
        conclusion: 'Was wrong',
        belief_strength_after: 20,
        is_example: 0,
        is_complete: 1,
        current_step: 7,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-05T00:00:00.000Z',
      },
    ]);

    const result = await repo.getExperiments(mockDb);

    expect(result).toHaveLength(1);
    expect(result[0].belief).toBe('Test belief');
    expect(result[0].beliefStrengthBefore).toBe(80);
    expect(result[0].beliefStrengthAfter).toBe(20);
    expect(result[0].status).toBe('completed');
  });
});

describe('updateExperiment', () => {
  it('updates both tables and sets status=completed when updating result fields', async () => {
    await repo.updateExperiment(mockDb, 'abc', {
      conclusion: 'Learned something',
      beliefStrengthAfter: 15,
      status: 'completed',
      isComplete: true,
      currentStep: 7,
    });

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
  });
});

describe('insertSeedExperiment', () => {
  it('inserts completed seed with is_example=1 into both tables', async () => {
    await repo.insertSeedExperiment(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    // First call: tool_entries with is_complete=1, current_step=7
    expect(calls[0][0]).toContain('tool_entries');
    expect(calls[0][1]).toContain(1);   // is_complete
    expect(calls[0][1]).toContain(7);   // current_step
    // Second call: behavioral_experiments with is_example=1
    expect(calls[1][0]).toContain('behavioral_experiments');
    expect(calls[1][1]).toContain(1);   // is_example
  });
});

describe('deleteAll', () => {
  it('executes DELETE on behavioral_experiments and tool_entries', async () => {
    await repo.deleteAll(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map(
      (c: unknown[]) => c[0] as string
    );
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('behavioral_experiments'))).toBe(true);
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('tool_entries'))).toBe(true);
  });
});
