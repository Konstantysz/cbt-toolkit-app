import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '../../core/theme/useColors';
import { useSettings } from '../../core/settings/store';
import { scaledFont } from '../../core/settings/fontScale';
import { spacing, radius } from '../../core/theme';

export default function CreditsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { fontSize } = useSettings();
  const fs = (base: number) => scaledFont(base, fontSize);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 56,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    backText: { fontSize: fs(16), color: colors.accent, marginRight: spacing.sm },
    headerTitle: { fontSize: fs(20), fontWeight: '700', color: colors.text },
    card: {
      margin: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    sectionTitle: {
      fontSize: fs(12),
      fontWeight: '700',
      color: colors.accent,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    body: { fontSize: fs(14), color: colors.text, lineHeight: 22 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
    packageRow: { flexDirection: 'row', marginBottom: spacing.xs },
    packageName: { fontSize: fs(13), color: colors.accent, width: 180 },
    packageDesc: { fontSize: fs(13), color: colors.textMuted, flex: 1 },
  });

  const packages: [string, string][] = [
    ['React Native', 'Interfejs użytkownika'],
    ['Expo', 'Platforma mobilna'],
    ['Zustand', 'Zarządzanie stanem'],
    ['expo-sqlite', 'Lokalna baza danych'],
    ['expo-notifications', 'Powiadomienia lokalne'],
    ['@react-native-community/datetimepicker', 'Picker czasu'],
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backText}>‹ Wstecz</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Twórcy i podziękowania</Text>
      </View>
      <View style={s.card}>
        <Text style={s.sectionTitle}>Autorzy</Text>
        <Text style={s.body}>
          Aplikacja Zestaw Narzędzi TPB jest projektem open-source stworzonym z myślą o osobach
          korzystających z terapii poznawczo-behawioralnej. Kod źródłowy dostępny na GitHub.
        </Text>
        <View style={s.divider} />
        <Text style={s.sectionTitle}>Biblioteki open-source</Text>
        {packages.map(([name, desc]) => (
          <View key={name} style={s.packageRow}>
            <Text style={s.packageName}>{name}</Text>
            <Text style={s.packageDesc}>{desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
