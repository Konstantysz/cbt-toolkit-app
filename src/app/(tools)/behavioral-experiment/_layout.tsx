import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { pl } from '../../../tools/behavioral-experiment/i18n/pl';
import { useColors } from '../../../core/theme/useColors';

function BackToHome() {
  const colors = useColors();
  const styles = StyleSheet.create({
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 4 },
    backLabel: { fontSize: 15, color: colors.accent },
  });
  return (
    <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
      <Ionicons name="chevron-back" size={18} color={colors.accent} />
      <Text style={styles.backLabel}>Narzędzia</Text>
    </TouchableOpacity>
  );
}

export default function BehavioralExperimentLayout(): React.JSX.Element {
  const colors = useColors();
  const stackScreenOptions = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
    headerShadowVisible: false,
    headerTitleStyle: { color: colors.text, fontWeight: '600' as const },
    headerTitleAlign: 'center' as const,
  };
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="index"
        options={{ title: pl.toolName, headerLeft: () => <BackToHome /> }}
      />
      <Stack.Screen name="new" options={{ title: 'Nowy eksperyment' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Eksperyment' }} />
      <Stack.Screen name="[id]/result" options={{ title: 'Dodaj wynik' }} />
    </Stack>
  );
}
