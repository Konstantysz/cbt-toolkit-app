import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme';

interface Props {
  value: number;       // 0–100
  onChange: (v: number) => void;
  label?: string;
}

export function IntensitySlider({ value, onChange, label }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {label ? <Text style={styles.label}>{label}</Text> : <View />}
        <Text style={styles.value}>{value}%</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  slider: { width: '100%', height: 30 },
});
