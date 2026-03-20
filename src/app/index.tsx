import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import { getEnabledTools } from '../tools/registry';
import type { ToolDefinition } from '../core/types/tool';

export default function HomeScreen(): React.JSX.Element {
  const tools = getEnabledTools();

  const renderTool = ({ item }: { item: ToolDefinition }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tools)${item.routePrefix}` as Parameters<typeof router.push>[0])}
    >
      <Text style={styles.toolName}>{item.name}</Text>
      <Text style={styles.toolDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tools}
        keyExtractor={item => item.id}
        renderItem={renderTool}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  toolName: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  toolDescription: { fontSize: 14, color: '#aaa' },
});
