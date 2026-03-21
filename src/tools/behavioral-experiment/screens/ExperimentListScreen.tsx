import React, { useCallback, useEffect } from 'react';
import {
  FlatList, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { colors } from '../../../core/theme';
import { useBehavioralExperiments } from '../hooks/useBehavioralExperiments';
import { insertSeedExperiment } from '../repository';
import { pl } from '../i18n/pl';
import type { BehavioralExperiment } from '../types';

export function ExperimentListScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { experiments, loading, refresh } = useBehavioralExperiments(db);

  // Onboarding seed — insert when list is empty on first load
  useEffect(() => {
    if (loading || experiments.length > 0) return;
    (async () => {
      try {
        await insertSeedExperiment(db);
        refresh();
      } catch {
        // non-critical
      }
    })();
  }, [loading, experiments.length, db, refresh]);

  const formatDate = useCallback((iso: string) =>
    format(parseISO(iso), 'd MMM yyyy', { locale: dateFnsPl }), []);

  const renderItem = useCallback(({ item }: { item: BehavioralExperiment }) => {
    const changeStr = item.beliefStrengthAfter !== null
      ? `${item.beliefStrengthBefore}% → ${item.beliefStrengthAfter}%`
      : `${item.beliefStrengthBefore}% → —`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tools)/behavioral-experiment/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          {item.isExample ? (
            <Text style={[styles.badge, styles.badgeExample]}>{pl.onboarding.badge}</Text>
          ) : item.status === 'completed' ? (
            <Text style={[styles.badge, styles.badgeCompleted]}>{pl.status.completed}</Text>
          ) : (
            <Text style={[styles.badge, styles.badgePlanned]}>{pl.status.planned}</Text>
          )}
        </View>
        <Text style={styles.belief} numberOfLines={2}>{item.belief}</Text>
        <Text style={styles.change}>{changeStr}</Text>
      </TouchableOpacity>
    );
  }, [formatDate]);

  if (loading) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {experiments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🧪</Text>
          <Text style={styles.emptyText}>{pl.list.empty}</Text>
          <Text style={styles.emptySub}>{pl.list.emptySub}</Text>
        </View>
      ) : (
        <FlatList
          data={experiments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tools)/behavioral-experiment/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 11, color: colors.textMuted, letterSpacing: 0.5 },
  badge: { fontSize: 10, letterSpacing: 0.8, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', textTransform: 'uppercase' },
  badgePlanned: { backgroundColor: 'rgba(108,142,239,0.12)', color: colors.accent },
  badgeCompleted: { backgroundColor: 'rgba(122,158,126,0.12)', color: colors.success },
  badgeExample: { backgroundColor: 'rgba(184,151,74,0.12)', color: colors.inProgress, borderWidth: 1, borderColor: 'rgba(184,151,74,0.25)' },
  belief: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: 6 },
  change: { fontSize: 12, color: colors.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyIcon: { fontSize: 40, opacity: 0.2 },
  emptyText: { fontSize: 18, color: colors.textMuted, fontStyle: 'italic' },
  emptySub: { fontSize: 13, color: colors.textDim, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: colors.accent, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  fabText: { fontSize: 28, color: colors.bg, lineHeight: 32, fontWeight: '300' },
});
