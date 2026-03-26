import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../core/theme';
import { pl } from '../../../tools/abc-model/i18n/pl';

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerTitleStyle: { color: colors.text, fontWeight: '600' as const },
  headerTitleAlign: 'center' as const,
};

function BackToHome() {
  return (
    <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
      <Ionicons name="chevron-back" size={18} color={colors.accent} />
      <Text style={styles.backLabel}>Narzędzia</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 4 },
  backLabel: { fontSize: 15, color: colors.accent },
});

export default function AbcModelLayout(): React.JSX.Element {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="index"
        options={{ title: pl.toolName, headerLeft: () => <BackToHome /> }}
      />
      <Stack.Screen name="new" options={{ title: pl.flow.newTitle }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Szczegóły' }} />
      <Stack.Screen name="[id]/edit" options={{ title: pl.flow.editTitle }} />
    </Stack>
  );
}
