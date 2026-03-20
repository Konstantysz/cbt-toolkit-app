import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { pl } from '../i18n/pl';

export function NewRecordFlow(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{pl.step1.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, color: '#fff' },
});
