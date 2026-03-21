import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { colors } from '../../../core/theme';
import { useThoughtRecords } from '../hooks/useThoughtRecords';
import { insertSeedRecord } from '../repository';
import { pl } from '../i18n/pl';
import type { ThoughtRecord } from '../types';

const ONBOARDING_KEY = 'thought-record:onboarding-seeded';

export function RecordListScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { records, loading, refresh } = useThoughtRecords(db);
  const [query, setQuery] = useState('');

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

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
    return records.filter(r =>
      r.situation.toLowerCase().includes(q) ||
      r.emotions.some(e => e.name.toLowerCase().includes(q))
    );
  }, [records, query]);

  const formatDate = useCallback((iso: string) =>
    format(parseISO(iso), 'd MMM yyyy · HH:mm', { locale: dateFnsPl }), []);

  const renderItem = useCallback(({ item }: { item: ThoughtRecord }) => {
    const emotionNames = item.emotions.map(e => e.name);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tools)/thought-record/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          {item.isExample
            ? <Text style={[styles.badge, styles.badgeExample]}>{pl.onboarding.badge}</Text>
            : item.isComplete
              ? <Text style={[styles.badge, styles.badgeComplete]}>Kompletny</Text>
              : <Text style={[styles.badge, styles.badgeInProgress]}>W toku</Text>
          }
        </View>
        {item.situation
          ? <Text style={styles.situation} numberOfLines={2}>{item.situation}</Text>
          : <Text style={[styles.situation, styles.situationEmpty]}>Brak opisu sytuacji</Text>
        }
        {emotionNames.length > 0 && (
          <View style={styles.tags}>
            {emotionNames.slice(0, 3).map(name => (
              <Text key={name} style={styles.tag}>{name}</Text>
            ))}
            {emotionNames.length > 3 && (
              <Text style={[styles.tag, styles.tagOverflow]}>+{emotionNames.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }, [formatDate]);

  if (loading) return <View style={styles.container} />;

  const showEmpty = filtered.length === 0;
  const showNoResults = showEmpty && query.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={pl.search.placeholder}
          placeholderTextColor={colors.textDim}
          clearButtonMode="while-editing"
        />
      </View>

      {showEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📓</Text>
          {showNoResults
            ? <Text style={styles.emptyText}>{pl.search.noResults(query)}</Text>
            : <>
                <Text style={styles.emptyText}>Brak wpisów</Text>
                <Text style={styles.emptySub}>Dotknij + aby dodać pierwszy zapis myśli.</Text>
              </>
          }
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
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
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 11, color: colors.textMuted, letterSpacing: 0.5 },
  badge: { fontSize: 10, letterSpacing: 0.8, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', textTransform: 'uppercase' },
  badgeComplete: { backgroundColor: 'rgba(122,158,126,0.12)', color: colors.success },
  badgeInProgress: { backgroundColor: 'rgba(184,151,74,0.1)', color: colors.inProgress },
  badgeExample: { backgroundColor: 'rgba(184,151,74,0.12)', color: colors.inProgress, borderWidth: 1, borderColor: 'rgba(184,151,74,0.25)' },
  situation: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: 10 },
  situationEmpty: { color: colors.textDim, fontStyle: 'italic' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { fontSize: 10, color: colors.accent, backgroundColor: colors.accentDim, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  tagOverflow: { color: colors.textDim },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyIcon: { fontSize: 40, opacity: 0.2 },
  emptyText: { fontSize: 18, color: colors.textMuted, fontStyle: 'italic' },
  emptySub: { fontSize: 13, color: colors.textDim, textAlign: 'center' },
  searchWrap: { position: 'relative', marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  searchIcon: { position: 'absolute', left: 14, top: 11, fontSize: 14, color: colors.textDim, zIndex: 1 },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingVertical: 11, paddingHorizontal: 14, paddingLeft: 36,
    fontSize: 13, color: colors.text,
  },
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
