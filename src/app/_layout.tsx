import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Tabs } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { initCoreTables, runMigrations } from '../core/db/database';
import { getAllMigrations } from '../tools/registry';
import { pl } from '../core/i18n/pl';
import { colors } from '../core/theme';

async function onInit(db: import('expo-sqlite').SQLiteDatabase) {
  await initCoreTables(db);
  await runMigrations(db, getAllMigrations());
}

function DbLoading() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export default function RootLayout(): React.JSX.Element {
  return (
    <SafeAreaProvider>
    <Suspense fallback={<DbLoading />}>
      <SQLiteProvider databaseName="cbt-toolkit.db" onInit={onInit}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textDim,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: pl.nav.home,
              tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: pl.nav.settings,
              tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
            }}
          />
          <Tabs.Screen name="(tools)/thought-record" options={{ href: null }} />
          <Tabs.Screen name="(tools)/behavioral-experiment" options={{ href: null }} />
        </Tabs>
      </SQLiteProvider>
    </Suspense>
    </SafeAreaProvider>
  );
}
