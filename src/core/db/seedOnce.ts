import * as SQLite from 'expo-sqlite';

const inFlight = new Map<string, Promise<boolean>>();

/**
 * Runs `insert` at most once per install. The flag row (in migrations_log, which
 * resetDatabase preserves) is written in the same transaction as the insert, so a
 * failed insert leaves no flag and deleting all entries never re-seeds.
 * Returns true if the example was inserted by this call.
 */
export function seedOnce(
  db: SQLite.SQLiteDatabase,
  toolId: string,
  insert: (db: SQLite.SQLiteDatabase) => Promise<void>
): Promise<boolean> {
  const running = inFlight.get(toolId);
  if (running) return running;
  const p = (async () => {
    let seeded = false;
    await db.withTransactionAsync(async () => {
      const done = await db.getFirstAsync('SELECT id FROM migrations_log WHERE id = ?', [
        `seed:${toolId}`,
      ]);
      if (done) return;
      await insert(db);
      await db.runAsync('INSERT INTO migrations_log (id) VALUES (?)', [`seed:${toolId}`]);
      seeded = true;
    });
    return seeded;
  })().finally(() => inFlight.delete(toolId));
  inFlight.set(toolId, p);
  return p;
}
