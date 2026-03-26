import { useLocalSearchParams } from 'expo-router';
import { NewAbcFlow } from '../../../../tools/abc-model/screens/NewAbcFlow';
export default function AbcEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NewAbcFlow existingId={id} />;
}
