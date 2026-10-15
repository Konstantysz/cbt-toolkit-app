import { useSettings } from './store';

/** Stack/Modal animation to use, honouring the in-app reduce-motion setting. */
export function useStackAnimation(): { animation: 'default' | 'none' } {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  return { animation: reducedMotion ? 'none' : 'default' };
}
