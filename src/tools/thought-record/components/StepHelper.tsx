import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../core/theme';
import { pl } from '../i18n/pl';

interface StepHelperProps {
  hint: string;
}

export function StepHelper({ hint }: StepHelperProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.toggle} onPress={() => setOpen(o => !o)}>
        <Text style={[styles.toggleText, open && styles.toggleOpen]}>
          {pl.helper.toggle}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.panel}>
          <Text style={styles.label}>{pl.helper.exampleLabel}</Text>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingVertical: 6, marginTop: 10, alignSelf: 'flex-start' },
  toggleText: { fontSize: 10, color: colors.textDim, letterSpacing: 0.08 },
  toggleOpen: { color: colors.accent },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  label: {
    fontSize: 9,
    color: colors.textDim,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hint: { fontSize: 15, color: colors.textMuted, lineHeight: 22, fontStyle: 'italic' },
});
