import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/useColors';
import { spacing, radius, typography } from '../theme';

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
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.icon, { color: colors.textDim }]} accessibilityElementsHidden>
        ⌕
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
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
    marginHorizontal: spacing.md,
    marginTop: spacing.md - 4,
    marginBottom: spacing.xs,
  },
  icon: {
    position: 'absolute',
    left: 14,
    top: 11,
    fontSize: typography.sm,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 14,
    paddingLeft: 36,
    fontSize: typography.sm,
  },
});
