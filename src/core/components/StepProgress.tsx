import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../theme/useColors';
import { spacing } from '../theme';

interface Props {
  totalSteps: number;
  currentStep: number; // 1-based
}

export function StepProgress({ totalSteps, currentStep }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        let bg: string = colors.border;
        if (stepNum < currentStep) bg = 'rgba(196,149,106,0.35)';
        if (stepNum === currentStep) bg = colors.accent;
        return <View key={i} style={[styles.seg, { backgroundColor: bg }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, paddingHorizontal: spacing.lg - 4, paddingVertical: spacing.md - 4 },
  seg: { flex: 1, height: 3, borderRadius: 2 },
});
