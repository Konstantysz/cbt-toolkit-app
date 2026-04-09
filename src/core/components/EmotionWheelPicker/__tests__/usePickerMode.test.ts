import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePickerMode } from '../usePickerMode';

const STORAGE_KEY = 'emotion_picker_mode';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usePickerMode', () => {
  it('defaults to chips mode when AsyncStorage is empty', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const { result } = renderHook(() => usePickerMode());
    await act(async () => {});
    expect(result.current.mode).toBe('chips');
  });

  it('loads saved mode from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('wheel');
    const { result } = renderHook(() => usePickerMode());
    await act(async () => {});
    expect(result.current.mode).toBe('wheel');
  });

  it('setMode updates state and writes to AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => usePickerMode());
    await act(async () => {});

    await act(async () => {
      result.current.setMode('wheel');
    });

    expect(result.current.mode).toBe('wheel');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'wheel');
  });
});
