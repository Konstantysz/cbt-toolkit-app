// src/tools/thought-record/components/TextStep.tsx
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '../../../core/theme/useColors';
import { radius, typography } from '../../../core/theme';

interface Props {
  prompt: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function useStyles() {
  const colors = useColors();
  return StyleSheet.create({
    prompt: { fontSize: typography.md - 1, lineHeight: 22, marginBottom: typography.md, fontStyle: 'italic', color: colors.textMuted },
    input: { borderWidth: 1, borderRadius: radius.md, padding: 15, fontSize: typography.md - 1, lineHeight: 24, backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
  });
}

export function TextStep({ prompt, value, onChange, placeholder, minHeight = 130 }: Props) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View>
      <Text style={styles.prompt}>{prompt}</Text>
      <TextInput
        style={[styles.input, { minHeight }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? ''}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}
