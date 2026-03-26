// src/app/(tools)/thought-record/[id]/form.tsx
import { useLocalSearchParams } from 'expo-router';
import { RecordFormScreen } from '../../../../tools/thought-record/screens/RecordFormScreen';

export default function FormRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecordFormScreen id={id} />;
}
