import { useCallback, useEffect, useRef, useState } from 'react';
import * as SQLite from 'expo-sqlite';

/**
 * Shared loader for tool data hooks. `refresh` is stable (depends on db only) and
 * ignores responses from superseded calls. With `autoKey` it also loads on mount
 * and whenever the key changes; without it the caller triggers loading (e.g. focus).
 */
export function useLoad<T>(
  db: SQLite.SQLiteDatabase | null,
  load: (db: SQLite.SQLiteDatabase) => Promise<T>,
  initial: T,
  autoKey?: string
) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const request = useRef(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  const refresh = useCallback(async () => {
    if (!db) return;
    const id = ++request.current;
    try {
      const result = await loadRef.current(db);
      if (id !== request.current) return;
      setData(result);
      setError(false);
    } catch {
      if (id !== request.current) return;
      setError(true);
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (autoKey === undefined) return;
    setLoading(true);
    refresh();
  }, [autoKey, refresh]);

  return { data, loading, error, refresh };
}
