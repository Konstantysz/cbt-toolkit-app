import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '../theme/useColors';
import { pl } from '../i18n/pl';

export function LoadError({ onRetry }: { onRetry: () => void }): React.JSX.Element {
  const colors = useColors();
  const styles = StyleSheet.create({
    box: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    text: { fontSize: 16, color: colors.textMuted, textAlign: 'center' },
    btn: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.accent,
    },
    btnText: { color: colors.bg, fontSize: 14 },
  });
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{pl.common.loadError}</Text>
      <TouchableOpacity style={styles.btn} onPress={onRetry} accessibilityRole="button">
        <Text style={styles.btnText}>{pl.common.retry}</Text>
      </TouchableOpacity>
    </View>
  );
}
