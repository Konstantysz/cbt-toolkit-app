// src/tools/thought-record/screens/RecordListScreen.tsx
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { colors } from '../../../core/theme';
import { useThoughtRecords } from '../hooks/useThoughtRecords';
import type { ThoughtRecord } from '../types';

export function RecordListScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { records, loading } = useThoughtRecords(db);

  function formatDate(iso: string) {
    return format(parseISO(iso), 'd MMM yyyy · HH:mm', { locale: dateFnsPl });
  }

  function renderItem({ item }: { item: ThoughtRecord }) {
    const emotionNames = item.emotions.map(e => e.name);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tools)/thought-record/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          {item.isComplete ? (
            <Text style={[styles.badge, styles.badgeComplete]}>Kompletny</Text>
          ) : (
            <Text style={[styles.badge, styles.badgeInProgress]}>W toku</Text>
          )}
        </View>
        {item.situation ? (
          <Text style={styles.situation} numberOfLines={2}>{item.situation}</Text>
        ) : (
          <Text style={[styles.situation, { color: colors.textDim, fontStyle: 'italic' }]}>
            Brak opisu sytuacji
          </Text>
        )}
        {emotionNames.length > 0 && (
          <View style={styles.tags}>
            {emotionNames.slice(0, 3).map(name => (
              <Text key={name} style={styles.tag}>{name}</Text>
            ))}
            {emotionNames.length > 3 && (
              <Text style={[styles.tag, { color: colors.textDim }]}>+{emotionNames.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📓</Text>
          <Text style={styles.emptyText}>Brak wpisów</Text>
          <Text style={styles.emptySub}>Dotknij + aby dodać pierwszy zapis myśli.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
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
  situation: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { fontSize: 10, color: colors.accent, backgroundColor: colors.accentDim, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
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
