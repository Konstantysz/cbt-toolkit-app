import * as SQLite from 'expo-sqlite';
import type { ThoughtRecord } from '../types';
import * as repo from '../repository';
import { useLoad } from '../../../core/db/useLoad';

const NONE: ThoughtRecord[] = [];

export function useThoughtRecords(db: SQLite.SQLiteDatabase | null) {
  const { data, loading, error, refresh } = useLoad(db, (d) => repo.getRecords(d), NONE);
  return { records: data, loading, error, refresh };
}

export function useThoughtRecord(db: SQLite.SQLiteDatabase | null, id: string) {
  const { data, loading, error, refresh } = useLoad<ThoughtRecord | null>(
    db,
    (d) => repo.getRecordById(d, id),
    null,
    id
  );
  return { record: data, loading, error, refresh };
}
