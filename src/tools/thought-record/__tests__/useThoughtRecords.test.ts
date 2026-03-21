import { renderHook, act } from '@testing-library/react-native';
import { useThoughtRecords } from '../hooks/useThoughtRecords';
import * as repo from '../repository';

jest.mock('../repository');

const mockDb = {} as any;
const makeRecord = (id: string) => ({
  id,
  situation: 'Test',
  emotions: [],
  automaticThought: '',
  evidenceFor: '',
  evidenceAgainst: '',
  balancedThought: '',
  actionPlan: '',
  isComplete: false,
  isExample: false,
  createdAt: '2026-03-21T10:00:00.000Z',
  updatedAt: '2026-03-21T10:00:00.000Z',
});

beforeEach(() => jest.clearAllMocks());

test('does not fetch on mount — refresh must be called explicitly', async () => {
  (repo.getRecords as jest.Mock).mockResolvedValue([]);
  renderHook(() => useThoughtRecords(mockDb));
  expect(repo.getRecords).not.toHaveBeenCalled();
});

test('sets loading=false after refresh completes', async () => {
  (repo.getRecords as jest.Mock).mockResolvedValue([makeRecord('1')]);
  const { result } = renderHook(() => useThoughtRecords(mockDb));

  await act(async () => { await result.current.refresh(); });

  expect(result.current.loading).toBe(false);
  expect(result.current.records).toHaveLength(1);
});

test('keeps loading=false during refresh when records already present', async () => {
  let resolveRefresh!: (data: any[]) => void;

  (repo.getRecords as jest.Mock)
    .mockResolvedValueOnce([makeRecord('1')])
    .mockImplementationOnce(() => new Promise(r => { resolveRefresh = r; }));

  const { result } = renderHook(() => useThoughtRecords(mockDb));

  await act(async () => { await result.current.refresh(); });
  expect(result.current.records).toHaveLength(1);
  expect(result.current.loading).toBe(false);

  // Start slow second refresh — loading should stay false
  act(() => { void result.current.refresh(); });
  expect(result.current.loading).toBe(false);

  // Resolve and verify still false
  await act(async () => { resolveRefresh([makeRecord('2')]); });
  expect(result.current.loading).toBe(false);
});
