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
import { IntensitySlider } from '../../../core/components/IntensitySlider';
import { useBehavioralExperiment } from '../hooks/useBehavioralExperiments';
import { pl } from '../i18n/pl';
import * as repo from '../repository';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  id: string;
}

function useStyles() {
  const colors = useColors();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { padding: 16, paddingBottom: 40 },
    missing: { color: colors.textMuted, fontStyle: 'italic' },
    beliefCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 20,
    },
    beliefLabel: {
      fontSize: 10,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    beliefText: {
      fontSize: 15,
      color: colors.text,
      fontStyle: 'italic',
      lineHeight: 22,
      marginBottom: 16,
    },
    sliderRow: { flexDirection: 'row', gap: 8 },
    sliderHalf: { flex: 1 },
    sliderSideLabel: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    sectionHeader: {
      fontSize: 11,
      color: colors.textDim,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
      marginTop: 8,
    },
    detailRow: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 11,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    detailValue: { fontSize: 14, color: colors.text, lineHeight: 21 },
    percentBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
      marginVertical: 6,
    },
    percentFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
    percentNum: { fontSize: 13, color: colors.accent, fontWeight: '600' },
    addResultBtn: {
      backgroundColor: colors.success,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 4,
    },
    addResultText: { fontSize: 15, color: colors.bg, fontWeight: '600' },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
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
    accentColor: { color: colors.accent },
  });
}

export function ExperimentDetailScreen({ id }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const { experiment, loading } = useBehavioralExperiment(db, id);
  const styles = useStyles();

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Usuń eksperyment',
      'Czy na pewno chcesz usunąć ten eksperyment? Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await repo.deleteExperiment(db, id);
              router.back();
            } catch {
              Alert.alert('Błąd', 'Nie udało się usunąć eksperymentu. Spróbuj ponownie.');
            }
          },
        },
      ]
    );
  }, [db, id]);

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={styles.accentColor.color} />
      </View>
    );
  if (!experiment)
    return (
      <View style={styles.centered}>
        <Text style={styles.missing}>Nie znaleziono eksperymentu.</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Weryfikowana myśl + porównanie suwakowe */}
      <View style={styles.beliefCard}>
        <Text style={styles.beliefLabel}>{pl.detail.belief}</Text>
        <Text style={styles.beliefText}>
          {'„'}
          {experiment.belief}
          {'"'}
        </Text>
        <View style={styles.sliderRow}>
          <View style={styles.sliderHalf}>
            <Text style={styles.sliderSideLabel}>{pl.detail.beliefStrengthBefore}</Text>
            <IntensitySlider
              value={experiment.beliefStrengthBefore}
              onChange={() => {}}
              label=""
              readOnly
            />
          </View>
          {experiment.beliefStrengthAfter != null && (
            <View style={styles.sliderHalf}>
              <Text style={styles.sliderSideLabel}>{pl.detail.beliefStrengthAfter}</Text>
              <IntensitySlider
                value={experiment.beliefStrengthAfter}
                onChange={() => {}}
                label=""
                readOnly
              />
            </View>
          )}
        </View>
      </View>

      {/* Plan section */}
      <Text style={styles.sectionHeader}>{pl.detail.planSection}</Text>
      <DetailRow label={pl.detail.plan} value={experiment.plan || '—'} styles={styles} />
      <DetailRow
        label={pl.detail.predictedOutcome}
        value={experiment.predictedOutcome || '—'}
        styles={styles}
      />
      <DetailRow
        label={pl.detail.potentialProblems}
        value={experiment.potentialProblems || '—'}
        styles={styles}
      />
      <DetailRow
        label={pl.detail.problemStrategies}
        value={experiment.problemStrategies || '—'}
        styles={styles}
      />

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

      {/* Result section */}
      {experiment.status === 'completed' && (
        <>
          <Text style={styles.sectionHeader}>{pl.detail.resultSection}</Text>
          {experiment.executionDate && (
            <DetailRow
              label={pl.detail.executionDate}
              value={format(parseISO(experiment.executionDate), 'd MMMM yyyy', {
                locale: dateFnsPl,
              })}
              styles={styles}
            />
          )}
          <DetailRow
            label={pl.detail.actualOutcome}
            value={experiment.actualOutcome || '—'}
            styles={styles}
          />
          {experiment.confirmationPercent != null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{pl.detail.confirmationPercent}</Text>
              <View style={styles.percentBar}>
                <View
                  style={[
                    styles.percentFill,
                    { width: `${experiment.confirmationPercent}%` as `${number}%` },
                  ]}
                />
              </View>
              <Text style={styles.percentNum}>{experiment.confirmationPercent}%</Text>
            </View>
          )}
          <DetailRow
            label={pl.detail.conclusion}
            value={experiment.conclusion || '—'}
            styles={styles}
          />
        </>
      )}

      {/* Edit / Delete */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/(tools)/behavioral-experiment/${id}/edit`)}
          activeOpacity={0.8}
          accessibilityLabel="Edytuj eksperyment"
        >
          <View style={iconRow}>
            <Ionicons
              name="create-outline"
              size={14}
              color={styles.accentColor.color}
              accessible={false}
            />
            <Text style={styles.editBtnText}>{pl.detail.edit}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>{pl.detail.delete}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof useStyles>;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}
