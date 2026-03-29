import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { useColors } from '../../../core/theme/useColors';
import { iconRow } from '../../../core/theme';
import { useThoughtRecord } from '../hooks/useThoughtRecords';
import * as repo from '../repository';
import type { Emotion } from '../types';
import { pl } from '../i18n/pl';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  id: string;
}

function useStyles() {
  const colors = useColors();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
    scroll: { padding: 20 },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
      gap: 12,
    },
    metaLeft: { flexDirection: 'column', gap: 5 },
    metaActions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' },
    actionBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 9,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    actionBtnText: { fontSize: 10, letterSpacing: 0.06, color: colors.textMuted },
    headerDate: { fontSize: 12, letterSpacing: 0.5, color: colors.textMuted },
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
    badgeTextComplete: { fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', includeFontPadding: false, lineHeight: 12, color: colors.success },
    badgeTextInProgress: { fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', includeFontPadding: false, lineHeight: 12, color: colors.inProgress },
    section: { marginBottom: 20 },
    stepNum: {
      fontSize: 10,
      color: colors.textDim,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 3,
    },
    stepTitle: { fontSize: 17, fontWeight: '500', marginBottom: 8, color: colors.accent },
    bodyText: { fontSize: 14, lineHeight: 23, color: colors.text },
    bodyTextEmpty: { fontSize: 14, lineHeight: 23, color: colors.textDim, fontStyle: 'italic' },
    emptyField: { fontStyle: 'italic', color: colors.textDim },
    divider: { height: 1, marginBottom: 20, backgroundColor: colors.border },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 32 },
    editBtn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    editBtnText: { fontSize: 14, color: colors.textMuted },
    deleteBtn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.dangerDim,
      borderWidth: 1,
      borderColor: 'rgba(196,96,90,0.22)',
    },
    deleteBtnText: { fontSize: 14, color: colors.danger },
    errorText: { fontSize: 15, color: colors.textMuted },
  });
}

function useEmotionRowStyles() {
  const colors = useColors();
  return StyleSheet.create({
    emotionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    emotionNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 90 },
    emotionName: { fontSize: 13, color: colors.text },
    emotionDrop: { fontSize: 12, fontWeight: '700', color: colors.success },
    intensityBars: { flex: 1 },
  });
}

function useIntensityBarStyles() {
  const colors = useColors();
  return StyleSheet.create({
    ibarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
      justifyContent: 'flex-end',
    },
    ibarLabel: { fontSize: 10, width: 28, textAlign: 'right', color: colors.textDim },
    ibarTrack: {
      width: 120,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    ibarFill: { height: '100%', borderRadius: 3 },
    ibarNum: { fontSize: 10, color: colors.textMuted },
  });
}

function IntensityBar({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  const colors = useColors();
  const styles = useIntensityBarStyles();
  return (
    <View style={styles.ibarRow}>
      <Text style={styles.ibarLabel}>{label}</Text>
      <View style={styles.ibarTrack}>
        <View
          style={[
            styles.ibarFill,
            {
              width: `${value}%` as `${number}%`,
              backgroundColor: accent ? colors.accent : 'rgba(196,149,106,0.35)',
            },
          ]}
        />
      </View>
      <Text style={styles.ibarNum}>{value}%</Text>
    </View>
  );
}

function EmotionRow({ emotion }: { emotion: Emotion }) {
  const styles = useEmotionRowStyles();
  const before = emotion.intensityBefore;
  const after = emotion.intensityAfter;
  const improved = after !== undefined && after < before;

  return (
    <View style={styles.emotionRow}>
      <View style={styles.emotionNameRow}>
        <Text style={styles.emotionName}>{emotion.name}</Text>
        {improved && <Text style={styles.emotionDrop}>↓</Text>}
      </View>
      <View style={styles.intensityBars}>
        <IntensityBar label="przed" value={before} />
        {after !== undefined && <IntensityBar label="po" value={after} accent />}
      </View>
    </View>
  );
}

export function RecordDetailScreen({ id }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const { record, loading } = useThoughtRecord(db, id);
  const colors = useColors();
  const styles = useStyles();

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Usuń wpis',
      'Czy na pewno chcesz usunąć ten zapis? Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await repo.deleteRecord(db, id);
              router.back();
            } catch {
              Alert.alert('Błąd', 'Nie udało się usunąć wpisu. Spróbuj ponownie.');
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

  if (!record) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Nie znaleziono wpisu.</Text>
      </View>
    );
  }

  const formattedDate = record.situationDate
    ? format(parseISO(record.situationDate), 'd MMMM yyyy', { locale: dateFnsPl })
    : format(parseISO(record.createdAt), 'd MMMM yyyy · HH:mm', { locale: dateFnsPl });

  const sections = [
    { step: '01', title: 'Sytuacja', text: record.situation },
    { step: '03', title: 'Myśli automatyczne', text: record.automaticThoughts },
    { step: '04', title: 'Argumenty za', text: record.evidenceFor },
    { step: '05', title: 'Argumenty przeciw', text: record.evidenceAgainst },
    { step: '06', title: 'Myśl alternatywna', text: record.alternativeThought },
    { step: '07', title: 'Podsumowanie', text: record.outcome ?? '' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Text style={styles.headerDate}>{formattedDate}</Text>
            {record.isComplete ? (
              <View style={[styles.badge, styles.badgeComplete]}>
                <Text style={styles.badgeTextComplete}>Kompletny</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeInProgress]}>
                <Text style={styles.badgeTextInProgress}>W toku</Text>
              </View>
            )}
          </View>
          <View style={styles.metaActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push(`/(tools)/thought-record/${id}/compare`)}
              accessibilityLabel="Porównaj zapisy"
            >
              <View style={iconRow}>
                <Ionicons
                  name="layers-outline"
                  size={14}
                  color={colors.accent}
                  accessible={false}
                />
                <Text style={styles.actionBtnText}>{pl.compare.btnLabel}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push(`/(tools)/thought-record/${id}/form`)}
              accessibilityLabel="Formularz papierowy"
            >
              <View style={iconRow}>
                <Ionicons
                  name="document-outline"
                  size={14}
                  color={colors.accent}
                  accessible={false}
                />
                <Text style={styles.actionBtnText}>{pl.form.btn}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emotions (step 02) */}
        <View style={styles.section}>
          <Text style={styles.stepNum}>Krok 02</Text>
          <Text style={styles.stepTitle}>Emocje</Text>
          {record.emotions.length === 0 ? (
            <Text style={styles.emptyField}>—</Text>
          ) : (
            record.emotions.map((em) => <EmotionRow key={em.name} emotion={em} />)
          )}
        </View>
        <View style={styles.divider} />

        {/* Text sections */}
        {sections.map((sec, i) => (
          <React.Fragment key={sec.step}>
            <View style={styles.section}>
              <Text style={styles.stepNum}>Krok {sec.step}</Text>
              <Text style={styles.stepTitle}>{sec.title}</Text>
              <Text style={sec.text ? styles.bodyText : styles.bodyTextEmpty}>
                {sec.text || '—'}
              </Text>
            </View>
            {i < sections.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/(tools)/thought-record/${id}/edit`)}
            activeOpacity={0.8}
            accessibilityLabel="Edytuj wpis"
          >
            <View style={iconRow}>
              <Ionicons name="create-outline" size={14} color={colors.accent} accessible={false} />
              <Text style={styles.editBtnText}>{pl.edit.title}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.8}>
            <Text style={styles.deleteBtnText}>Usuń wpis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
