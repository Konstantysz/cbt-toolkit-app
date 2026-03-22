import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { NewExperimentFlow } from '../../../../tools/behavioral-experiment/screens/NewExperimentFlow';

export default function EditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NewExperimentFlow phase="plan" experimentId={id} />;
}
