// src/tools/thought-record/components/TextStep.tsx
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../core/theme';

interface Props {
  prompt: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function TextStep({ prompt, value, onChange, placeholder, minHeight = 130 }: Props) {
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

const styles = StyleSheet.create({
  prompt: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
});
