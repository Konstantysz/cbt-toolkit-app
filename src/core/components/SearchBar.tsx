import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Szukaj...',
}: SearchBarProps): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon} accessibilityElementsHidden>⌕</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        clearButtonMode="while-editing"
        returnKeyType="search"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  icon: {
    position: 'absolute',
    left: 14,
    top: 11,
    fontSize: 14,
    color: colors.textDim,
    zIndex: 1,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    paddingLeft: 36,
    fontSize: 13,
    color: colors.text,
  },
});
