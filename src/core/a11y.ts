import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Speak a message through the active screen reader (no-op when none is running). */
export function announce(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/** Announce `message` whenever it becomes a non-empty, changed string. */
export function useAnnounce(message: string | undefined): void {
  useEffect(() => {
    if (message) announce(message);
  }, [message]);
}

/** Skip the first render, then announce each change of `key`. */
export function useAnnounceChange(key: unknown, message: string): void {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    announce(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function useScreenReaderEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((v) => alive && setEnabled(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return enabled;
}
