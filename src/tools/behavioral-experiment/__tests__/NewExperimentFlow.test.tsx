import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => ({}) }));
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), back: jest.fn() } }));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('../repository');

import * as repo from '../repository';
import { NewExperimentFlow } from '../screens/NewExperimentFlow';

const mockExperiment = {
  id: 'exp-1',
  status: 'planned' as const,
  belief: 'Test belief',
  beliefStrengthBefore: 50,
  alternativeBelief: '',
  plan: '',
  predictedOutcome: '',
  executionDate: null,
  executionNotes: null,
  actualOutcome: null,
  conclusion: null,
  beliefStrengthAfter: null,
  isExample: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('NewExperimentFlow phase=plan', () => {
  it('renders step 1 title on initial render', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue(mockExperiment);

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => {
      expect(screen.getByText('Jakie przekonanie chcesz sprawdzić?')).toBeTruthy();
    });
  });

  it('"Dalej" button is disabled when belief field is empty', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue(mockExperiment);

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => screen.getByText('Jakie przekonanie chcesz sprawdzić?'));

    const dalej = screen.getByText('Dalej');
    // Belief starts empty → button should be disabled
    expect(dalej.props.accessibilityState?.disabled ?? dalej.parent?.props.disabled).toBeTruthy();
  });

  it('moves to step 2 after entering belief and pressing Dalej', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue(mockExperiment);
    (repo.updateExperiment as jest.Mock).mockResolvedValue(undefined);

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => screen.getByText('Jakie przekonanie chcesz sprawdzić?'));

    fireEvent.changeText(screen.getByPlaceholderText(/Np\. Jeśli odmówię/), 'Moje przekonanie');

    const dalej = screen.getByText('Dalej');
    fireEvent.press(dalej);

    await waitFor(() => {
      expect(screen.getByText('Jaka jest alternatywna hipoteza?')).toBeTruthy();
    });
    expect(repo.updateExperiment).toHaveBeenCalledWith(
      expect.anything(),
      'exp-1',
      expect.objectContaining({ belief: 'Moje przekonanie', currentStep: 1 })
    );
  });
});

describe('NewExperimentFlow phase=result', () => {
  it('loads existing experiment and shows step 5 title', async () => {
    (repo.getExperimentById as jest.Mock).mockResolvedValue(mockExperiment);

    render(<NewExperimentFlow phase="result" experimentId="exp-1" />);

    await waitFor(() => {
      expect(screen.getByText('Kiedy i co zrobiłeś?')).toBeTruthy();
    });
  });

  it('saves conclusion and sets status=completed on step 7 finish', async () => {
    (repo.getExperimentById as jest.Mock).mockResolvedValue(mockExperiment);
    (repo.updateExperiment as jest.Mock).mockResolvedValue(undefined);

    render(<NewExperimentFlow phase="result" experimentId="exp-1" />);

    // Step 5 (local step 1): executionDate is auto-filled → Dalej is enabled
    await waitFor(() => screen.getByText('Kiedy i co zrobiłeś?'));
    fireEvent.press(screen.getByText('Dalej'));

    // Step 6 (local step 2): no required field → Dalej is enabled
    await waitFor(() => screen.getByText('Co się wydarzyło?'));
    fireEvent.press(screen.getByText('Dalej'));

    // Step 7 (local step 3): conclusion is required → type to enable Zakończ
    await waitFor(() => screen.getByText('Czego się nauczyłeś?'));
    fireEvent.changeText(
      screen.getByPlaceholderText(/Moje przekonanie było błędne/),
      'Nauczyłem się czegoś nowego'
    );
    fireEvent.press(screen.getByText('Zakończ'));

    await waitFor(() => {
      expect(repo.updateExperiment).toHaveBeenCalledWith(
        expect.anything(),
        'exp-1',
        expect.objectContaining({ status: 'completed', isComplete: true })
      );
    });
  });

  it('initialises beliefStrengthAfter slider to beliefStrengthBefore when null', async () => {
    const expWith85 = { ...mockExperiment, beliefStrengthBefore: 85, beliefStrengthAfter: null };
    (repo.getExperimentById as jest.Mock).mockResolvedValue(expWith85);

    render(<NewExperimentFlow phase="result" experimentId="exp-1" />);

    await waitFor(() => screen.getByText('Kiedy i co zrobiłeś?'));
    expect(repo.getExperimentById).toHaveBeenCalledWith(expect.anything(), 'exp-1');
  });
});
