import { seedOnce } from '../seedOnce';

// Minimal in-memory db: migrations_log flag rows + transactional rollback of the flag.
function makeDb() {
  const flags = new Set<string>();
  const db = {
    flags,
    getFirstAsync: jest.fn(async (_sql: string, [id]: string[]) => (flags.has(id) ? { id } : null)),
    runAsync: jest.fn(async (_sql: string, [id]: string[]) => {
      flags.add(id);
    }),
    withTransactionAsync: jest.fn(async (fn: () => Promise<void>) => {
      const snapshot = new Set(flags);
      try {
        await fn();
      } catch (e) {
        flags.clear();
        snapshot.forEach((f) => flags.add(f));
        throw e;
      }
    }),
  };
  return db;
}

describe('seedOnce', () => {
  it('inserts once, then never again (even after entries are deleted)', async () => {
    const db = makeDb();
    const insert = jest.fn().mockResolvedValue(undefined);

    expect(await seedOnce(db as never, 'tool-a', insert)).toBe(true);
    expect(await seedOnce(db as never, 'tool-a', insert)).toBe(false);

    expect(insert).toHaveBeenCalledTimes(1);
    expect(db.flags.has('seed:tool-a')).toBe(true);
  });

  it('writes no flag when the insert fails, so a later attempt can seed', async () => {
    const db = makeDb();
    const failing = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(seedOnce(db as never, 'tool-b', failing)).rejects.toThrow('boom');
    expect(db.flags.has('seed:tool-b')).toBe(false);

    const ok = jest.fn().mockResolvedValue(undefined);
    expect(await seedOnce(db as never, 'tool-b', ok)).toBe(true);
  });

  it('concurrent calls insert only once', async () => {
    const db = makeDb();
    const insert = jest.fn().mockResolvedValue(undefined);

    await Promise.all([
      seedOnce(db as never, 'tool-c', insert),
      seedOnce(db as never, 'tool-c', insert),
    ]);

    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('keeps flags separate per tool', async () => {
    const db = makeDb();
    const insert = jest.fn().mockResolvedValue(undefined);

    await seedOnce(db as never, 'tool-d', insert);
    await seedOnce(db as never, 'tool-e', insert);

    expect(insert).toHaveBeenCalledTimes(2);
  });
});
