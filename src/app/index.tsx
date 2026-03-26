import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getEnabledTools } from '../tools/registry';
import { colors, spacing, radius } from '../core/theme';
import type { ToolDefinition } from '../core/types/tool';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_SIZE = (SCREEN_WIDTH - 2 * spacing.lg - spacing.sm) / 2;

export default function HomeScreen(): React.JSX.Element {
  const tools = getEnabledTools();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <Text style={styles.appTitle}>CBT Toolkit</Text>
        <Text style={styles.appSubtitle}>
          Narzędzia terapii poznawczo-behawioralnej
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>NARZĘDZIA</Text>
        <View style={styles.sectionLine} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        {tools.map((tool: ToolDefinition) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.card}
            activeOpacity={0.75}
            onPress={() =>
              router.navigate(
                `/(tools)${tool.routePrefix}` as Parameters<
                  typeof router.navigate
                >[0],
              )
            }
          >
            <View style={styles.cardAccentLine} />
            <Ionicons
              name={tool.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={52}
              color={colors.accent}
            />
            <Text style={styles.toolName}>{tool.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  cardAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accentBorder,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 19,
  },
});
