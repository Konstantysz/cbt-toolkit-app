import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useColors } from '../theme/useColors';
import { pl } from '../i18n/pl';
import { spacing, radius, typography } from '../theme';

interface Props {
  value: number; // 0-100
  onChange: (v: number) => void;
  label?: string;
  a11yLabel?: string;
  readOnly?: boolean;
}

function useStyles() {
  const colors = useColors();
  return StyleSheet.create({
    container: {
      borderRadius: radius.md,
      borderWidth: 1,
      padding: 14,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
      borderColor: colors.border,
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
      color: colors.text,
    },
    value: {
      fontSize: typography.lg,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
      color: colors.accent,
    },
    slider: { width: '100%', height: 30 },
  });
}

export function IntensitySlider({ value, onChange, label, a11yLabel, readOnly }: Props) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={styles.container} pointerEvents={readOnly ? 'none' : 'auto'}>
      <View style={styles.header}>
        {label ? <Text style={styles.label}>{label}</Text> : <View />}
        <Text style={styles.value}>{value}%</Text>
      </View>
      <Slider
        testID="intensity-slider"
        accessibilityLabel={a11yLabel || label || pl.a11y.intensity}
        accessibilityValue={{ min: 0, max: 100, now: value, text: pl.a11y.intensityValue(value) }}
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
