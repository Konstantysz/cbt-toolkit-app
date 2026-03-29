import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { useColors } from '../../../core/theme/useColors';
import { colors } from '../../../core/theme';
import { SearchBar } from '../../../core/components/SearchBar';
import { useThoughtRecords } from '../hooks/useThoughtRecords';
import { insertSeedRecord } from '../repository';
import { pl } from '../i18n/pl';
import type { ThoughtRecord } from '../types';

const ONBOARDING_KEY = 'thought-record:onboarding-seeded';

export function RecordListScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { records, loading, refresh } = useThoughtRecords(db);
  const colors = useColors();
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Onboarding seed
  useEffect(() => {
    if (records.length > 0) return;
    (async () => {
      try {
        const val = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (val !== null) return;
        await insertSeedRecord(db);
        await AsyncStorage.setItem(ONBOARDING_KEY, '1');
        refresh();
      } catch {
        // seed failure is non-critical — user can still add records manually
      }
    })();
  }, [records.length, db, refresh]);

  // Search filter — OR logic, case-insensitive
  const filtered = useMemo(() => {
    if (!query) return records;
    const q = query.toLowerCase();
    return records.filter(
      (r) =>
        r.situation.toLowerCase().includes(q) ||
        r.emotions.some((e) => e.name.toLowerCase().includes(q))
    );
  }, [records, query]);

  const formatDate = useCallback(
    (iso: string) => format(parseISO(iso), 'd MMM yyyy · HH:mm', { locale: dateFnsPl }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: ThoughtRecord }) => {
      const emotionNames = item.emotions.map((e) => e.name);
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/(tools)/thought-record/${item.id}`)}
          activeOpacity={0.8}
        >
          <View style={styles.cardTop}>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            {item.isExample ? (
              <View style={[styles.badge, styles.badgeExample]}>
                <Text style={[styles.badgeText, { color: colors.inProgress }]}>
                  {pl.onboarding.badge}
                </Text>
              </View>
            ) : item.isComplete ? (
              <View style={[styles.badge, styles.badgeComplete]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Kompletny</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeInProgress]}>
                <Text style={[styles.badgeText, { color: colors.inProgress }]}>W toku</Text>
              </View>
            )}
          </View>
          {item.situation ? (
            <Text style={styles.situation} numberOfLines={2}>
              {item.situation}
            </Text>
          ) : (
            <Text style={[styles.situation, styles.situationEmpty]}>Brak opisu sytuacji</Text>
          )}
          {emotionNames.length > 0 && (
            <View style={styles.tags}>
              {emotionNames.slice(0, 3).map((name) => (
                <View key={name} style={styles.tag}>
                  <Text style={styles.tagText}>{name}</Text>
                </View>
              ))}
              {emotionNames.length > 3 && (
                <View style={styles.tag}>
                  <Text style={[styles.tagText, styles.tagOverflow]}>
                    +{emotionNames.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [formatDate]
  );

  if (loading) return <View style={styles.container} />;

  const showEmpty = filtered.length === 0;
  const showNoResults = showEmpty && query.length > 0;

  return (
    <View style={styles.container}>
      <SearchBar value={query} onChangeText={setQuery} placeholder={pl.search.placeholder} />

      {showEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📓</Text>
          {showNoResults ? (
            <Text style={styles.emptyText}>{pl.search.noResults(query)}</Text>
          ) : (
            <>
              <Text style={styles.emptyText}>Brak wpisów</Text>
              <Text style={styles.emptySub}>Dotknij + aby dodać pierwszy zapis myśli.</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tools)/thought-record/new')}
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: { fontSize: 11, color: colors.textMuted, letterSpacing: 0.5 },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    includeFontPadding: false,
    lineHeight: 12,
  },
  badgeComplete: { backgroundColor: 'rgba(122,158,126,0.12)' },
  badgeInProgress: { backgroundColor: 'rgba(184,151,74,0.1)' },
  badgeExample: {
    backgroundColor: 'rgba(184,151,74,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(184,151,74,0.25)',
  },
  situation: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: 10 },
  situationEmpty: { color: colors.textDim, fontStyle: 'italic' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: {
    backgroundColor: colors.accentDim,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: { fontSize: 10, color: colors.accent, includeFontPadding: false, lineHeight: 12 },
  tagOverflow: { color: colors.textDim },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyIcon: { fontSize: 40, opacity: 0.2 },
  emptyText: { fontSize: 18, color: colors.textMuted, fontStyle: 'italic' },
  emptySub: { fontSize: 13, color: colors.textDim, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { fontSize: 28, color: colors.bg, lineHeight: 32, fontWeight: '300' },
});
