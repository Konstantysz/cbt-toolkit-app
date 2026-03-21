import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ExperimentDetailScreen } from '../../../../tools/behavioral-experiment/screens/ExperimentDetailScreen';

export default function ExperimentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExperimentDetailScreen id={id!} />;
}
