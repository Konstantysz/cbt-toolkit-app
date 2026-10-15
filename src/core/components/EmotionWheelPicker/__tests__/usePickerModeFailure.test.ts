import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePickerMode } from '../usePickerMode';

describe('usePickerMode — unreadable storage', () => {
  it('falls back to the default mode and stops loading when getItem rejects', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('read failed'));
    const { result } = renderHook(() => usePickerMode());
    await act(async () => {});
    expect(result.current.mode).toBe('chips');
    expect(result.current.isLoading).toBe(false);
  });
});
