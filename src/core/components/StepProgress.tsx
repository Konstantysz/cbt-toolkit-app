import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../theme/useColors';


interface Props {
  totalSteps: number;
  currentStep: number; // 1-based
}

function useStyles() {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: 5, paddingHorizontal: 20, paddingVertical: 12 },
    seg: { flex: 1, height: 3, borderRadius: 2 },
  });
}

export function StepProgress({ totalSteps, currentStep }: Props) {
  const styles = useStyles();
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
