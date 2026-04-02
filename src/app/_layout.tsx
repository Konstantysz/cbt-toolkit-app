import React, { Suspense, useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Tabs } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { initCoreTables, runMigrations } from '../core/db/database';
import { getAllMigrations } from '../tools/registry';
import { pl } from '../core/i18n/pl';
import { useColors } from '../core/theme/useColors';
import { useSettings } from '../core/settings/store';
import { scheduleReminder, cancelReminder } from '../core/notifications/schedule';
import { useAuthGuard } from '../core/auth/useAuthGuard';
import { PinOnboardingScreen } from '../core/auth/screens/PinOnboardingScreen';
import { PinSetupScreen } from '../core/auth/screens/PinSetupScreen';
import { PinLockScreen } from '../core/auth/screens/PinLockScreen';

async function onInit(db: import('expo-sqlite').SQLiteDatabase) {
  await initCoreTables(db);
  await runMigrations(db, getAllMigrations());
}

function DbLoading() {
  const colors = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

function AppContent() {
  const colors = useColors();
  const reminderEnabled = useSettings((s) => s.reminderEnabled);
  const reminderTime = useSettings((s) => s.reminderTime);
  const { authPhase, goToSetup, goToUnlocked } = useAuthGuard();

  useEffect(() => {
    if (!reminderEnabled) return;
    cancelReminder().then(() => scheduleReminder(reminderTime));
  }, [reminderEnabled, reminderTime]);

  const tabScreenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textDim,
    }),
    [colors]
  );

  if (authPhase === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (authPhase === 'onboarding') {
    return <PinOnboardingScreen onSetup={goToSetup} onSkip={goToUnlocked} />;
  }

  if (authPhase === 'setup') {
    return <PinSetupScreen onComplete={goToUnlocked} />;
  }

  if (authPhase === 'locked') {
    return <PinLockScreen onUnlock={goToUnlocked} />;
  }

  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: pl.nav.home,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: pl.nav.settings,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="(tools)/thought-record" options={{ href: null }} />
      <Tabs.Screen name="(tools)/behavioral-experiment" options={{ href: null }} />
      <Tabs.Screen name="(tools)/abc-model" options={{ href: null }} />
    </Tabs>
  );
}

export default function RootLayout(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <Suspense fallback={<DbLoading />}>
        <SQLiteProvider databaseName="cbt-toolkit.db" onInit={onInit}>
          <AppContent />
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}
