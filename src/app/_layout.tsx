import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { SQLiteDatabase } from 'expo-sqlite';
import { openDatabase, runMigrations } from '../core/db/database';
import { getAllMigrations } from '../tools/registry';
import { pl } from '../core/i18n/pl';

export default function RootLayout(): React.JSX.Element | null {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);

  useEffect(() => {
    async function init() {
      const database = await openDatabase();
      await runMigrations(database, getAllMigrations());
      setDb(database);
    }
    init().catch(console.error);
  }, []);

  if (!db) return null;

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: pl.nav.home, tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: pl.nav.settings, tabBarIcon: () => null }}
      />
    </Tabs>
  );
}
