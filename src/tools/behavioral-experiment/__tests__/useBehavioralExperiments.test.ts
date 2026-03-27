import { renderHook, act } from '@testing-library/react-native';
import { useBehavioralExperiments } from '../hooks/useBehavioralExperiments';
import * as repo from '../repository';

jest.mock('../repository');

const mockDb = {} as any;
const makeExperiment = (id: string) => ({
  id,
  status: 'planned' as const,
  belief: 'Test',
  beliefStrengthBefore: 50,
  beliefStrengthAfter: null,
  alternativeBelief: '',
  plan: '',
  predictedOutcome: '',
  executionDate: null,
  executionNotes: null,
  actualOutcome: null,
  conclusion: null,
  isExample: false,
  createdAt: '2026-03-21T10:00:00.000Z',
  updatedAt: '2026-03-21T10:00:00.000Z',
});

beforeEach(() => jest.clearAllMocks());

test('does not fetch on mount — refresh must be called explicitly', async () => {
  (repo.getExperiments as jest.Mock).mockResolvedValue([]);
  renderHook(() => useBehavioralExperiments(mockDb));
  expect(repo.getExperiments).not.toHaveBeenCalled();
});

test('sets loading=false after refresh completes', async () => {
  (repo.getExperiments as jest.Mock).mockResolvedValue([makeExperiment('1')]);
  const { result } = renderHook(() => useBehavioralExperiments(mockDb));

  await act(async () => {
    await result.current.refresh();
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.experiments).toHaveLength(1);
});

test('keeps loading=false during refresh when experiments already present', async () => {
  let resolveRefresh!: (data: any[]) => void;

  (repo.getExperiments as jest.Mock)
    .mockResolvedValueOnce([makeExperiment('1')])
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolveRefresh = r;
        })
    );

  const { result } = renderHook(() => useBehavioralExperiments(mockDb));

  await act(async () => {
    await result.current.refresh();
  });
  expect(result.current.experiments).toHaveLength(1);
  expect(result.current.loading).toBe(false);

  // Start slow second refresh — loading should stay false
  act(() => {
    void result.current.refresh();
  });
  expect(result.current.loading).toBe(false);

  // Resolve and verify still false
  await act(async () => {
    resolveRefresh([makeExperiment('2')]);
  });
  expect(result.current.loading).toBe(false);
});
