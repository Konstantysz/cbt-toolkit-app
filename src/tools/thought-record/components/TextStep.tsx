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

export function TextStep({ prompt, value, onChange, placeholder, minHeight = 130 }: Props) {
  const colors = useColors();
  return (
    <View>
      <Text style={[styles.prompt, { color: colors.textMuted }]}>{prompt}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }, { minHeight }]}
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

const styles = StyleSheet.create({
  prompt: { fontSize: typography.md - 1, lineHeight: 22, marginBottom: typography.md, fontStyle: 'italic' },
  input: { borderWidth: 1, borderRadius: radius.md, padding: 15, fontSize: typography.md - 1, lineHeight: 24 },
});
