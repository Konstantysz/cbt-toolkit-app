import React from 'react';
import { Stack } from 'expo-router';
import { pl } from '../../../tools/thought-record/i18n/pl';

export default function ThoughtRecordLayout(): React.JSX.Element {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: pl.toolName }} />
      <Stack.Screen name="new" options={{ title: 'Nowy wpis' }} />
      <Stack.Screen name="[id]" options={{ title: 'Szczegóły' }} />
    </Stack>
  );
}
