import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '../../core/theme/useColors';
import { spacing, radius } from '../../core/theme';
import { pl } from '../../core/i18n/pl';

export default function CreditsScreen() {
  const router = useRouter();
  const colors = useColors();

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 56,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    backText: { fontSize: 16, color: colors.accent, marginRight: spacing.sm },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    card: {
      margin: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    body: { fontSize: 14, color: colors.text, lineHeight: 22 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
    packageRow: { flexDirection: 'row', marginBottom: spacing.xs },
    packageName: { fontSize: 13, color: colors.accent, width: 180 },
    packageDesc: { fontSize: 13, color: colors.textMuted, flex: 1 },
  });

  const packages: [string, string][] = [
    ['React Native', pl.settings.credits.packages.reactNative],
    ['Expo', pl.settings.credits.packages.expo],
    ['Zustand', pl.settings.credits.packages.zustand],
    ['expo-sqlite', pl.settings.credits.packages.sqlite],
    ['expo-notifications', pl.settings.credits.packages.notifications],
    ['@react-native-community/datetimepicker', pl.settings.credits.packages.datetimepicker],
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={pl.common.back}
          onPress={() => router.back()}
        >
          <Text style={s.backText}>{pl.common.backWithChevron}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} accessibilityRole="header">
          {pl.settings.about.credits}
        </Text>
      </View>
      <View style={s.card}>
        <Text style={s.sectionTitle} accessibilityRole="header">
          {pl.settings.credits.authors}
        </Text>
        <Text style={s.body}>{pl.settings.credits.authorsBody}</Text>
        <View style={s.divider} />
        <Text style={s.sectionTitle} accessibilityRole="header">
          {pl.settings.credits.libraries}
        </Text>
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
