import { colors, highContrastColors } from './index';
import { useSettings } from '../settings/store';

export function useColors() {
  const highContrast = useSettings((s) => s.highContrast);
  return highContrast ? highContrastColors : colors;
}
