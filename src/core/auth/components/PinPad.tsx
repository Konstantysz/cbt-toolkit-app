import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../../theme/useColors';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'] as const;
const PIN_LENGTH = 4;

export interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
}

export function PinPad({ value, onChange, label, error }: PinPadProps) {
  const colors = useColors();

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: { alignItems: 'center', gap: 24 },
        label: { fontSize: 18, fontWeight: '600', color: colors.text },
        error: { fontSize: 14, color: colors.danger },
        dots: { flexDirection: 'row', gap: 16 },
        dot: {
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: colors.border,
        },
        dotFilled: { backgroundColor: colors.accent },
        grid: { gap: 12 },
        row: { flexDirection: 'row', gap: 12 },
        key: {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        keyText: { fontSize: 24, fontWeight: '500', color: colors.text },
        keyEmpty: { backgroundColor: 'transparent', borderWidth: 0 },
      }),
    [colors]
  );

  function handleKey(key: string) {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
    } else if (key !== '' && value.length < PIN_LENGTH) {
      onChange(value + key);
    }
  }

  const rows = [KEYS.slice(0, 3), KEYS.slice(3, 6), KEYS.slice(6, 9), KEYS.slice(9, 12)];

  return (
    <View style={s.container}>
      <Text style={s.label}>{label}</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <View style={s.dots}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View key={i} style={[s.dot, i < value.length && s.dotFilled]} />
        ))}
      </View>
      <View style={s.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.map((k, ki) => (
              <TouchableOpacity
                key={ki}
                style={[s.key, k === '' && s.keyEmpty]}
                onPress={() => handleKey(k)}
                disabled={k === ''}
                accessibilityLabel={k === '⌫' ? 'usuń' : k}
              >
                {k !== '' && <Text style={s.keyText}>{k}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
