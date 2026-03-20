import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import type { ThoughtRecord } from '../types';
import * as repo from '../repository';

export function useThoughtRecords(db: SQLite.SQLiteDatabase | null) {
  const [records, setRecords] = useState<ThoughtRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const data = await repo.getRecords(db);
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, loading, refresh };
}
