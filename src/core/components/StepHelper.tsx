import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/useColors';

interface StepHelperProps {
  hint: string;
  toggleLabel?: string;
  exampleLabel?: string;
}

function useStyles() {
  const colors = useColors();
  return StyleSheet.create({
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
      backgroundColor: colors.accentDim,
      borderColor: colors.accentBorder,
    },
    toggleActive: { backgroundColor: colors.accentBorder },
    toggleText: {
      fontSize: 11,
      letterSpacing: 0.3,
      includeFontPadding: false,
      color: colors.accent,
    },
    panel: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      marginTop: 10,
      marginBottom: 4,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    label: {
      fontSize: 9,
      letterSpacing: 0.14,
      textTransform: 'uppercase',
      marginBottom: 6,
      color: colors.textDim,
    },
    hint: { fontSize: 15, lineHeight: 22, fontStyle: 'italic', color: colors.textMuted },
  });
}

export function StepHelper({
  hint,
  toggleLabel = 'Wskazówka',
  exampleLabel = 'Przykład',
}: StepHelperProps): React.JSX.Element {
  const styles = useStyles();
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
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleText}>{toggleLabel}</Text>
        <Ionicons
          testID="step-helper-chevron"
          name={open ? 'chevron-up' : 'chevron-down'}
          size={12}
          color={styles.toggleText.color}
          accessible={false}
        />
      </TouchableOpacity>
    </View>
  );
}
