import { type SQLiteDatabase } from 'expo-sqlite';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  routePrefix: string;
  migrations: Migration[];
  enabled: boolean;
  version: string;
}

export interface Migration {
  id: string;
  description: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}
