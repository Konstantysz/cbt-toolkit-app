import { renderHook, act } from '@testing-library/react-native';
import { useLoad } from '../useLoad';

const db = {} as never;

describe('useLoad', () => {
  it('does not fetch on mount without autoKey', async () => {
    const load = jest.fn().mockResolvedValue([1]);
    renderHook(() => useLoad(db, load, [] as number[]));
    await act(async () => {});
    expect(load).not.toHaveBeenCalled();
  });

  it('fetches exactly once on mount with autoKey', async () => {
    const load = jest.fn().mockResolvedValue('x');
    const { result } = renderHook(() => useLoad<string | null>(db, load, null, 'id'));
    await act(async () => {});
    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe('x');
    expect(result.current.loading).toBe(false);
  });

  it('exposes error, and retry via refresh clears it', async () => {
    const load = jest.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue([1]);
    const { result } = renderHook(() => useLoad(db, load, [] as number[]));

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBe(false);
    expect(result.current.data).toEqual([1]);
  });

  it('refresh identity is stable when data changes', async () => {
    const load = jest.fn().mockResolvedValue([1, 2, 3]);
    const { result } = renderHook(() => useLoad(db, load, [] as number[]));
    const first = result.current.refresh;
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.refresh).toBe(first);
  });

  it('ignores stale responses', async () => {
    let resolveOld!: (v: string) => void;
    const load = jest
      .fn()
      .mockImplementationOnce(() => new Promise<string>((r) => (resolveOld = r)))
      .mockResolvedValueOnce('new');
    const { result } = renderHook(() => useLoad<string>(db, load, ''));

    let old!: Promise<void>;
    act(() => {
      old = result.current.refresh();
    });
    await act(async () => {
      await result.current.refresh();
    });
    await act(async () => {
      resolveOld('old');
      await old;
    });

    expect(result.current.data).toBe('new');
  });

  it('does nothing when db is null', async () => {
    const load = jest.fn();
    const { result } = renderHook(() => useLoad(null, load, 0));
    await act(async () => {
      await result.current.refresh();
    });
    expect(load).not.toHaveBeenCalled();
  });
});
