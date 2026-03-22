import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface StepHelperProps {
  hint: string;
  toggleLabel?: string;
  exampleLabel?: string;
}

export function StepHelper({
  hint,
  toggleLabel = 'Wskazówka',
  exampleLabel = 'Przykład',
}: StepHelperProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <View>
      {open && (
        <View style={styles.panel}>
          <Text style={styles.label}>{exampleLabel}</Text>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.toggle, open && styles.toggleActive]}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleText}>{toggleLabel}</Text>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toggleActive: {
    backgroundColor: 'rgba(196,149,106,0.22)',
  },
  toggleText: {
    fontSize: 11,
    color: colors.accent,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  chevron: {
    fontSize: 8,
    color: colors.accent,
    includeFontPadding: false,
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  label: { fontSize: 9, color: colors.textDim, letterSpacing: 0.14, textTransform: 'uppercase', marginBottom: 6 },
  hint: { fontSize: 15, color: colors.textMuted, lineHeight: 22, fontStyle: 'italic' },
});
