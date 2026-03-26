import { useLocalSearchParams } from 'expo-router';
import { AbcDetailScreen } from '../../../../tools/abc-model/screens/AbcDetailScreen';
export default function AbcDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AbcDetailScreen id={id} />;
}
