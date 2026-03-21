import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '../../../core/theme';
import { useThoughtRecord } from '../hooks/useThoughtRecords';
import { pl } from '../i18n/pl';
import type { Emotion } from '../../../core/types';

interface CompareScreenProps {
  id: string;
}

const PAGE_LABELS = [
  pl.compare.page1,
  pl.compare.page2,
  pl.compare.page3,
  pl.compare.page4,
];

const TOTAL_PAGES = 4;

export function CompareScreen({ id }: CompareScreenProps): React.JSX.Element {
  const db = useSQLiteContext();
  const { record, loading } = useThoughtRecord(db, id);
  const [page, setPage] = useState(0);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={colors.accent} /></View>;
  }
  if (!record) {
    return <View style={styles.centered}><Text style={styles.errorText}>Nie znaleziono wpisu.</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Dots + label */}
      <View style={styles.topBar}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.pageLabel}>{PAGE_LABELS[page]}</Text>
      </View>

      {/* Columns */}
      <View style={styles.cols}>
        <LeftColumn page={page} record={record} />
        <RightColumn page={page} record={record} />
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.arrowBtn, page === 0 && styles.arrowBtnDisabled]}
          onPress={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pageNum}>{page + 1} / {TOTAL_PAGES}</Text>
        <TouchableOpacity
          style={[styles.arrowBtn, page === TOTAL_PAGES - 1 && styles.arrowBtnDisabled]}
          onPress={() => setPage(p => Math.min(TOTAL_PAGES - 1, p + 1))}
          disabled={page === TOTAL_PAGES - 1}
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type RecordType = NonNullable<ReturnType<typeof useThoughtRecord>['record']>;

function ColPanel({ title, children }: {
  title: string; children: React.ReactNode;
}) {
  return (
    <ScrollView style={styles.col} contentContainerStyle={styles.colContent}>
      <Text style={styles.colTitle}>{title}</Text>
      {children}
    </ScrollView>
  );
}

function ColText({ text }: { text: string }) {
  return <Text style={styles.colText}>{text || '—'}</Text>;
}

function CompactEmotionBars({ emotions }: { emotions: Emotion[] }) {
  return (
    <>
      {emotions.map(em => (
        <View key={em.name} style={styles.compactEmRow}>
          <Text style={styles.compactEmName}>{em.name}{em.intensityAfter !== undefined && em.intensityAfter < em.intensityBefore ? ' ↓' : ''}</Text>
          <View style={styles.compactBars}>
            <View style={styles.compactBarRow}>
              <Text style={styles.compactBarLabel}>przed</Text>
              <View style={styles.compactTrack}>
                <View style={[styles.compactFill, { width: `${em.intensityBefore}%` as `${number}%`, backgroundColor: 'rgba(196,149,106,0.35)' }]} />
              </View>
              <Text style={styles.compactBarNum}>{em.intensityBefore}%</Text>
            </View>
            {em.intensityAfter !== undefined && (
              <View style={styles.compactBarRow}>
                <Text style={styles.compactBarLabel}>po</Text>
                <View style={styles.compactTrack}>
                  <View style={[styles.compactFill, { width: `${em.intensityAfter}%` as `${number}%`, backgroundColor: colors.accent }]} />
                </View>
                <Text style={styles.compactBarNum}>{em.intensityAfter}%</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </>
  );
}

function LeftColumn({ page, record }: { page: number; record: RecordType }) {
  switch (page) {
    case 0: return <ColPanel title="Sytuacja"><ColText text={record.situation} /></ColPanel>;
    case 1: return <ColPanel title="Emocje"><CompactEmotionBars emotions={record.emotions} /></ColPanel>;
    case 2: return <ColPanel title="Myśli automatyczne"><ColText text={record.automaticThoughts} /></ColPanel>;
    case 3: return (
      <ColPanel title="">
        <Text style={[styles.colTitle, { color: colors.success }]}>Argumenty za</Text>
        <ColText text={record.evidenceFor} />
        <View style={styles.subDivider} />
        <Text style={[styles.colTitle, { color: colors.danger }]}>Argumenty przeciw</Text>
        <ColText text={record.evidenceAgainst} />
      </ColPanel>
    );
    default: return null;
  }
}

function RightColumn({ page, record }: { page: number; record: RecordType }) {
  switch (page) {
    case 0: return <ColPanel title="Emocje"><CompactEmotionBars emotions={record.emotions} /></ColPanel>;
    case 1: return <ColPanel title="Myśli automatyczne"><ColText text={record.automaticThoughts} /></ColPanel>;
    case 2: return (
      <ColPanel title="">
        <Text style={[styles.colTitle, { color: colors.success }]}>Argumenty za</Text>
        <ColText text={record.evidenceFor} />
        <View style={styles.subDivider} />
        <Text style={[styles.colTitle, { color: colors.danger }]}>Argumenty przeciw</Text>
        <ColText text={record.evidenceAgainst} />
      </ColPanel>
    );
    case 3: return <ColPanel title="Myśl alternatywna"><ColText text={record.alternativeThought} /></ColPanel>;
    default: return null;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, paddingBottom: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  errorText: { fontSize: 15, color: colors.textMuted },
  topBar: { alignItems: 'center', paddingVertical: 14, gap: 6 },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 18, borderRadius: 3, backgroundColor: colors.accent },
  pageLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase' },
  cols: { flex: 1, flexDirection: 'row', gap: 10 },
  col: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 13 },
  colContent: { padding: 13, gap: 8 },
  colTitle: { fontSize: 14, color: colors.accent, fontWeight: '500', marginBottom: 6 },
  colText: { fontSize: 12, color: colors.text, lineHeight: 19 },
  subDivider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 },
  arrowBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  arrowBtnDisabled: { opacity: 0.25 },
  arrowText: { fontSize: 20, color: colors.textMuted },
  pageNum: { fontSize: 11, color: colors.textDim, letterSpacing: 0.1 },
  compactEmRow: { marginBottom: 10 },
  compactEmName: { fontSize: 11, color: colors.text, marginBottom: 3 },
  compactBars: { gap: 3 },
  compactBarRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  compactBarLabel: { fontSize: 8, color: colors.textDim, width: 24, textAlign: 'right' },
  compactTrack: { width: 72, height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  compactFill: { height: '100%', borderRadius: 3 },
  compactBarNum: { fontSize: 9, color: colors.textMuted },
});
