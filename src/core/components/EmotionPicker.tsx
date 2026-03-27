import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import type { Emotion } from '../types';

export const PREDEFINED_EMOTIONS = [
  { key: 'anxiety', label: 'Niepokój', negative: true },
  { key: 'fear', label: 'Lęk', negative: true },
  { key: 'sadness', label: 'Smutek', negative: true },
  { key: 'anger', label: 'Złość', negative: true },
  { key: 'guilt', label: 'Poczucie winy', negative: true },
  { key: 'shame', label: 'Wstyd', negative: true },
  { key: 'frustration', label: 'Frustracja', negative: true },
  { key: 'helplessness', label: 'Bezradność', negative: true },
  { key: 'loneliness', label: 'Samotność', negative: true },
  { key: 'disappointment', label: 'Rozczarowanie', negative: true },
  { key: 'jealousy', label: 'Zazdrość', negative: true },
  { key: 'disgust', label: 'Obrzydzenie', negative: true },
  { key: 'joy', label: 'Radość', negative: false },
  { key: 'relief', label: 'Ulga', negative: false },
  { key: 'pride', label: 'Duma', negative: false },
  { key: 'gratitude', label: 'Wdzięczność', negative: false },
  { key: 'hope', label: 'Nadzieja', negative: false },
  { key: 'excitement', label: 'Ekscytacja', negative: false },
  { key: 'calm', label: 'Spokój', negative: false },
  { key: 'satisfaction', label: 'Satysfakcja', negative: false },
] as const;

interface Props {
  selected: Emotion[];
  onChange: (emotions: Emotion[]) => void;
}

export function EmotionPicker({ selected, onChange }: Props) {
  const selectedNames = new Set(selected.map((e) => e.name));

  function toggle(label: string) {
    if (selectedNames.has(label)) {
      onChange(selected.filter((e) => e.name !== label));
    } else {
      onChange([...selected, { name: label, intensityBefore: 50 }]);
    }
  }

  return (
    <View style={styles.grid}>
      {PREDEFINED_EMOTIONS.map((em) => {
        const isSelected = selectedNames.has(em.label);
        return (
          <TouchableOpacity
            key={em.key}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => toggle(em.label)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{em.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.accent,
  },
});
