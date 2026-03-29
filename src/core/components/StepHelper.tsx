import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/useColors';
import { spacing, radius, typography } from '../theme';

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
  const colors = useColors();
  const [open, setOpen] = useState(false);

  return (
    <View>
      {open && (
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textDim }]}>{exampleLabel}</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.toggle, { backgroundColor: colors.accentDim, borderColor: colors.accentBorder }, open && styles.toggleActive]}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.7}
      >
        <Text style={[styles.toggleText, { color: colors.accent }]}>{toggleLabel}</Text>
        <Ionicons
          testID="step-helper-chevron"
          name={open ? 'chevron-up' : 'chevron-down'}
          size={12}
          color={colors.accent}
          accessible={false}
        />
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
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toggleActive: { backgroundColor: 'rgba(196,149,106,0.22)' },
  toggleText: { fontSize: 11, letterSpacing: 0.3, includeFontPadding: false },
  panel: { borderWidth: 1, borderRadius: radius.sm + 2, padding: spacing.md - 4, marginTop: 10, marginBottom: 4 },
  label: { fontSize: 9, letterSpacing: 0.14, textTransform: 'uppercase', marginBottom: 6 },
  hint: { fontSize: typography.md - 1, lineHeight: 22, fontStyle: 'italic' },
});
