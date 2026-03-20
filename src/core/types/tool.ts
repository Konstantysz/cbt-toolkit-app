import { type SQLiteDatabase } from 'expo-sqlite';
import React from 'react';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  routePrefix: string;
  migrations: Migration[];
  HomeWidget?: React.ComponentType;
  enabled: boolean;
  version: string;
}

export interface Migration {
  id: string;
  description: string;
  up: (db: SQLiteDatabase) => Promise<void>;
  down?: (db: SQLiteDatabase) => Promise<void>;
}
