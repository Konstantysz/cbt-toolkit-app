import * as SQLite from 'expo-sqlite';

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

const mockRow = {
  id: 'test-uuid-1234',
  status: 'planned',
  belief: '',
  plan: '',
  predicted_outcome: '',
  potential_problems: '',
  problem_strategies: '',
  actual_outcome: null,
  confirmation_percent: null,
  conclusion: null,
  is_example: 0,
  is_complete: 0,
  current_step: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('createExperiment', () => {
  it('inserts into tool_entries and behavioral_experiments, returns record', async () => {
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockRow);

    const result = await repo.createExperiment(mockDb);

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
    expect(result.id).toBe('test-uuid-1234');
    expect(result.status).toBe('planned');
    expect(result.belief).toBe('');
    expect(result.potentialProblems).toBe('');
    expect(result.confirmationPercent).toBeNull();
  });
});

describe('getExperiments', () => {
  it('returns mapped array with new fields', async () => {
    (mockDb.getAllAsync as jest.Mock).mockResolvedValueOnce([
      {
        ...mockRow,
        id: 'abc',
        status: 'completed',
        belief: 'Test belief',
        plan: 'Zrobię X',
        predicted_outcome: 'Stanie się Y',
        potential_problems: 'Może przeszkodzić Z',
        problem_strategies: 'Zaradzę przez W',
        actual_outcome: 'Stało się Q',
        confirmation_percent: 30,
        conclusion: 'Nauczyłem się R',
        is_complete: 1,
        current_step: 8,
      },
    ]);

    const result = await repo.getExperiments(mockDb);

    expect(result).toHaveLength(1);
    expect(result[0].belief).toBe('Test belief');
    expect(result[0].potentialProblems).toBe('Może przeszkodzić Z');
    expect(result[0].problemStrategies).toBe('Zaradzę przez W');
    expect(result[0].confirmationPercent).toBe(30);
    expect(result[0].conclusion).toBe('Nauczyłem się R');
  });
});

describe('updateExperiment', () => {
  it('updates result fields and sets status=completed', async () => {
    await repo.updateExperiment(mockDb, 'abc', {
      conclusion: 'Learned something',
      confirmationPercent: 25,
      status: 'completed',
      isComplete: true,
      currentStep: 8,
    });

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
  });

  it('updates plan fields', async () => {
    await repo.updateExperiment(mockDb, 'abc', {
      potentialProblems: 'Może padać deszcz',
      problemStrategies: 'Wezmę parasol',
      currentStep: 4,
    });

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
  });
});

describe('insertSeedExperiment', () => {
  it('inserts completed seed with is_example=1 into both tables', async () => {
    await repo.insertSeedExperiment(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toContain('tool_entries');
    expect(calls[0][1]).toContain(1);  // is_complete
    expect(calls[0][1]).toContain(8);  // current_step (5 plan + 3 result)
    expect(calls[1][0]).toContain('behavioral_experiments');
    expect(calls[1][1]).toContain(1);  // is_example
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
