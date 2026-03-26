import React, { useCallback } from 'react';
import {
  ActivityIndicator, Alert, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { colors } from '../../../core/theme';
import { AbcGraph } from '../components/AbcGraph';
import { useAbcEntry } from '../hooks/useAbcEntries';
import * as repo from '../repository';
import { pl } from '../i18n/pl';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  id: string;
}

export function AbcDetailScreen({ id }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const { entry, loading } = useAbcEntry(db, id);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      pl.detail.deleteConfirmTitle,
      pl.detail.deleteConfirmMsg,
      [
        { text: pl.detail.deleteConfirmCancel, style: 'cancel' },
        {
          text: pl.detail.deleteConfirmOk,
          style: 'destructive',
          onPress: async () => {
            try {
              await repo.deleteEntry(db, id);
              router.back();
            } catch {
              Alert.alert('Błąd', pl.detail.deleteError);
            }
          },
        },
      ]
    );
  }, [db, id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{pl.detail.notFound}</Text>
      </View>
    );
  }

  const formattedDate = format(
    parseISO(entry.createdAt),
    'd MMMM yyyy · HH:mm',
    { locale: dateFnsPl }
  );

  const textSections = [
    { label: pl.detail.sectionA, text: entry.situation },
    { label: pl.detail.sectionB, text: entry.thoughts },
    { label: pl.detail.sectionC1, text: entry.behaviors },
    { label: pl.detail.sectionC2, text: entry.emotions },
    { label: pl.detail.sectionC3, text: entry.physicalSymptoms },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Meta row */}
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formattedDate}</Text>
          {entry.isComplete
            ? <View style={[styles.badge, styles.badgeComplete]}><Text style={[styles.badgeText, { color: colors.success }]}>{pl.detail.complete}</Text></View>
            : <View style={[styles.badge, styles.badgeInProgress]}><Text style={[styles.badgeText, { color: colors.inProgress }]}>{pl.detail.inProgress}</Text></View>
          }
        </View>

        {/* SVG Graph */}
        <View style={styles.graphCard}>
          <AbcGraph
            situation={entry.situation}
            thoughts={entry.thoughts}
            behaviors={entry.behaviors}
            emotions={entry.emotions}
            physicalSymptoms={entry.physicalSymptoms}
          />
        </View>

        {/* Text sections */}
        {textSections.map((sec, i) => (
          <React.Fragment key={sec.label}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{sec.label}</Text>
              <Text style={[styles.sectionBody, !sec.text && styles.emptyField]}>
                {sec.text || '—'}
              </Text>
            </View>
            {i < textSections.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </ScrollView>

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/(tools)/abc-model/${id}/edit`)}
          activeOpacity={0.8}
        >
          <View style={styles.iconRow}>
            <Ionicons name="create-outline" size={14} color={colors.accent} />
            <Text style={styles.editBtnText}>{pl.detail.editBtn}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>{pl.detail.deleteBtn}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  date: { fontSize: 12, color: colors.textMuted, letterSpacing: 0.5, flex: 1 },
  badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', includeFontPadding: false, lineHeight: 12 },
  badgeComplete: { backgroundColor: 'rgba(122,158,126,0.12)' },
  badgeInProgress: { backgroundColor: 'rgba(184,151,74,0.1)' },
  graphCard: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 12, marginBottom: 24,
  },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 10, color: colors.textDim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 5 },
  sectionBody: { fontSize: 14, color: colors.text, lineHeight: 22 },
  emptyField: { color: colors.textDim, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 28 },
  editBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  editBtnText: { fontSize: 14, color: colors.textMuted },
  deleteBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
    backgroundColor: colors.dangerDim, borderWidth: 1, borderColor: 'rgba(196,96,90,0.22)',
  },
  deleteBtnText: { color: colors.danger, fontSize: 14 },
  errorText: { fontSize: 15, color: colors.textMuted },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
