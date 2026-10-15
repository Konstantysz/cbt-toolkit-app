import { Stack } from 'expo-router';
import { useStackAnimation } from '../../core/settings/useReducedMotion';

export default function SettingsLayout() {
  const motion = useStackAnimation();
  return <Stack screenOptions={{ headerShown: false, ...motion }} />;
}
