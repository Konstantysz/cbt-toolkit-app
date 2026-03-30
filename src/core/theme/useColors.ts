import { PALETTES } from './index';
import { useSettings } from '../settings/store';

export function useColors() {
  const palette = useSettings((s) => s.palette);
  const darkMode = useSettings((s) => s.darkMode);
  const highContrast = useSettings((s) => s.highContrast);
  const p = PALETTES[palette] ?? PALETTES['warm-dark'];
  if (darkMode) {
    return highContrast ? p.darkHighContrast : p.dark;
  }
  return highContrast ? p.lightHighContrast : p.light;
}
