import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RecordDetailScreen } from '../../../../tools/thought-record/screens/RecordDetailScreen';

export default function DetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecordDetailScreen id={id} />;
}
