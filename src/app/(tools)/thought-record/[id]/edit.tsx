import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { NewRecordFlow } from '../../../../tools/thought-record/screens/NewRecordFlow';

export default function EditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NewRecordFlow existingId={id} />;
}
