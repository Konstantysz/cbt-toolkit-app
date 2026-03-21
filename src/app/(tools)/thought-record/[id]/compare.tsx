import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { CompareScreen } from '../../../../tools/thought-record/screens/CompareScreen';

export default function CompareRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CompareScreen id={id} />;
}
