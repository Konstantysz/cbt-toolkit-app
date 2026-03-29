import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useColors } from '../theme/useColors';
import { spacing, radius, typography } from '../theme';

interface Props {
  value: number; // 0-100
  onChange: (v: number) => void;
  label?: string;
  readOnly?: boolean;
}

export function IntensitySlider({ value, onChange, label, readOnly }: Props) {
  const colors = useColors();
  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      pointerEvents={readOnly ? 'none' : 'auto'}
    >
      <View style={styles.header}>
        {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : <View />}
        <Text style={[styles.value, { color: colors.accent }]}>{value}%</Text>
      </View>
      <Slider
        testID="intensity-slider"
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 14,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: '500',
  },
  value: {
    fontSize: typography.lg,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  slider: { width: '100%', height: 30 },
});
