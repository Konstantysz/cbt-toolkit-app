import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getEnabledTools } from '../tools/registry';
import { colors, spacing, radius } from '../core/theme';
import type { ToolDefinition } from '../core/types/tool';

export default function HomeScreen(): React.JSX.Element {
  const tools = getEnabledTools();
  const insets = useSafeAreaInsets();

  const renderTool = ({ item }: { item: ToolDefinition }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => router.navigate(`/(tools)${item.routePrefix}` as Parameters<typeof router.navigate>[0])}
    >
      <View style={styles.cardAccent} />
      <View style={styles.cardContent}>
        <Text style={styles.toolName}>{item.name}</Text>
        <Text style={styles.toolDescription}>{item.description}</Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <Text style={styles.appTitle}>CBT Toolkit</Text>
        <Text style={styles.appSubtitle}>Narzędzia terapii poznawczo-behawioralnej</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>NARZĘDZIA</Text>
        <View style={styles.sectionLine} />
      </View>

      <FlatList
        data={tools}
        keyExtractor={item => item.id}
        renderItem={renderTool}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.md }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 1.5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
  },
  toolDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: 22,
    color: colors.textDim,
    paddingRight: spacing.md,
  },
});
