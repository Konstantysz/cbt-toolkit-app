import React from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { colors } from '../../../core/theme';
import { useBehavioralExperiment } from '../hooks/useBehavioralExperiments';
import { IntensitySlider } from '../../../core/components/IntensitySlider';
import { pl } from '../i18n/pl';

interface Props { id: string; }

export function ExperimentDetailScreen({ id }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const { experiment, loading } = useBehavioralExperiment(db, id);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.accent} /></View>;
  if (!experiment) return <View style={styles.centered}><Text style={styles.missing}>Nie znaleziono eksperymentu.</Text></View>;

  const formatDate = (iso: string) => format(parseISO(iso), 'd MMMM yyyy', { locale: dateFnsPl });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Belief comparison card */}
      <View style={styles.beliefCard}>
        <Text style={styles.beliefText}>„{experiment.belief}"</Text>
        <View style={styles.sliderRow}>
          <View style={styles.sliderHalf}>
            <Text style={styles.sliderSideLabel}>{pl.detail.beliefBefore}</Text>
            <IntensitySlider
              value={experiment.beliefStrengthBefore}
              onChange={() => {}}
              label=""
            />
          </View>
          <View style={styles.sliderHalf}>
            <Text style={styles.sliderSideLabel}>{pl.detail.beliefAfter}</Text>
            <IntensitySlider
              value={experiment.beliefStrengthAfter ?? experiment.beliefStrengthBefore}
              onChange={() => {}}
              label=""
            />
          </View>
        </View>
      </View>

      {/* Plan section */}
      <Text style={styles.sectionHeader}>{pl.detail.planSection}</Text>
      <DetailRow label={pl.detail.alternativeBelief} value={experiment.alternativeBelief || '—'} />
      <DetailRow label={pl.detail.plan} value={experiment.plan || '—'} />
      <DetailRow label={pl.detail.predictedOutcome} value={experiment.predictedOutcome || '—'} />

      {/* Result section */}
      {experiment.status === 'completed' && (
        <>
          <Text style={styles.sectionHeader}>{pl.detail.resultSection}</Text>
          {experiment.executionDate && (
            <DetailRow label={pl.detail.executionDate} value={formatDate(experiment.executionDate)} />
          )}
          <DetailRow label={pl.detail.executionNotes} value={experiment.executionNotes || '—'} />
          <DetailRow label={pl.detail.actualOutcome} value={experiment.actualOutcome || '—'} />
          <DetailRow label={pl.detail.conclusion} value={experiment.conclusion || '—'} />
        </>
      )}

      {/* Add result button */}
      {experiment.status === 'planned' && (
        <TouchableOpacity
          style={styles.addResultBtn}
          onPress={() => router.push(`/(tools)/behavioral-experiment/${id}/result`)}
          activeOpacity={0.85}
        >
          <Text style={styles.addResultText}>{pl.detail.addResult}</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  missing: { color: colors.textMuted, fontStyle: 'italic' },
  beliefCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 20,
  },
  beliefText: { fontSize: 15, color: colors.text, fontStyle: 'italic', lineHeight: 22, marginBottom: 16 },
  sliderRow: { flexDirection: 'row', gap: 8 },
  sliderHalf: { flex: 1 },
  sliderSideLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 4, letterSpacing: 0.5 },
  sectionHeader: { fontSize: 11, color: colors.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 8 },
  detailRow: {
    backgroundColor: colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    padding: 14, marginBottom: 8,
  },
  detailLabel: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  detailValue: { fontSize: 14, color: colors.text, lineHeight: 21 },
  addResultBtn: {
    backgroundColor: colors.success, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  addResultText: { fontSize: 15, color: colors.bg, fontWeight: '600' },
});
