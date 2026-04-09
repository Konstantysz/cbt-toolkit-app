import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PickerMode = 'chips' | 'wheel';

const STORAGE_KEY = 'emotion_picker_mode';

interface UsePickerModeResult {
  mode: PickerMode;
  setMode: (mode: PickerMode) => void;
}

export function usePickerMode(): UsePickerModeResult {
  const [mode, setModeState] = useState<PickerMode>('chips');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'wheel' || saved === 'chips') {
        setModeState(saved);
      }
    });
  }, []);

  function setMode(next: PickerMode) {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  return { mode, setMode };
}
