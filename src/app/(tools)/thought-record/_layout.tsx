import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { pl } from '../../../tools/thought-record/i18n/pl';
import { useColors } from '../../../core/theme/useColors';

function BackToHome() {
  const colors = useColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 4 },
        backLabel: { fontSize: 15, color: colors.accent },
      }),
    [colors]
  );
  return (
    <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
      <Ionicons name="chevron-back" size={18} color={colors.accent} />
      <Text style={styles.backLabel}>Narzędzia</Text>
    </TouchableOpacity>
  );
}

export default function ThoughtRecordLayout(): React.JSX.Element {
  const colors = useColors();
  const stackScreenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerShadowVisible: false,
      headerTitleStyle: { color: colors.text, fontWeight: '600' as const },
      headerTitleAlign: 'center' as const,
    }),
    [colors]
  );
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="index"
        options={{ title: pl.toolName, headerLeft: () => <BackToHome /> }}
      />
      <Stack.Screen name="new" options={{ title: 'Nowy wpis' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Szczegóły' }} />
      <Stack.Screen name="[id]/compare" options={{ title: 'Porównanie' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edytuj wpis' }} />
      <Stack.Screen name="[id]/form" options={{ title: pl.form.title }} />
    </Stack>
  );
}
