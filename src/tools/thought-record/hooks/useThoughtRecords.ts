import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import type { ThoughtRecord } from '../types';
import * as repo from '../repository';

export function useThoughtRecords(db: SQLite.SQLiteDatabase | null) {
  const [records, setRecords] = useState<ThoughtRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db) return;
    if (records.length === 0) setLoading(true);
    try {
      const data = await repo.getRecords(db);
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }, [db, records.length]);

  return { records, loading, refresh };
}

export function useThoughtRecord(db: SQLite.SQLiteDatabase | null, id: string) {
  const [record, setRecord] = useState<ThoughtRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    repo
      .getRecordById(db, id)
      .then(setRecord)
      .finally(() => setLoading(false));
  }, [db, id]);

  return { record, loading };
}
