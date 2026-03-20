import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { pl } from '../core/i18n/pl';

export default function SettingsScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{pl.nav.settings}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, color: '#fff' },
});
