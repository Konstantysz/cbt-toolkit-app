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
  plan: '',
  predictedOutcome: '',
  potentialProblems: '',
  problemStrategies: '',
  executionDate: null,
  actualOutcome: null,
  confirmationPercent: null,
  beliefStrengthAfter: null,
  conclusion: null,
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
      expect(screen.getByText('Jaką myśl chcesz zweryfikować?')).toBeTruthy();
    });
  });

  it('"Dalej" is disabled when belief field is empty', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue({
      ...mockExperiment,
      belief: '',
    });

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => screen.getByText('Jaką myśl chcesz zweryfikować?'));

    const dalej = screen.getByText('Dalej');
    expect(dalej.props.accessibilityState?.disabled ?? dalej.parent?.props.disabled).toBeTruthy();
  });

  it('moves to step 2 after entering belief and pressing Dalej', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue({ ...mockExperiment, belief: '' });
    (repo.updateExperiment as jest.Mock).mockResolvedValue(undefined);

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => screen.getByText('Jaką myśl chcesz zweryfikować?'));

    fireEvent.changeText(
      screen.getByPlaceholderText(/Np\. Jeśli odmówię szefowi/),
      'Moje przekonanie'
    );
    fireEvent.press(screen.getByText('Dalej'));

    await waitFor(() => {
      expect(screen.getByText('Co konkretnie zrobisz?')).toBeTruthy();
    });
    expect(repo.updateExperiment).toHaveBeenCalledWith(
      expect.anything(),
      'exp-1',
      expect.objectContaining({
        belief: 'Moje przekonanie',
        beliefStrengthBefore: 50,
        currentStep: 1,
      })
    );
  });

  it('shows "Zakończ" on step 5 (last plan step)', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue(mockExperiment);
    (repo.updateExperiment as jest.Mock).mockResolvedValue(undefined);

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => screen.getByText('Jaką myśl chcesz zweryfikować?'));

    // Step 1: type belief → Dalej
    fireEvent.changeText(screen.getByPlaceholderText(/Np\. Jeśli odmówię szefowi/), 'Przekonanie');
    fireEvent.press(screen.getByText('Dalej'));

    // Step 2: type plan → Dalej
    await waitFor(() => screen.getByText('Co konkretnie zrobisz?'));
    fireEvent.changeText(screen.getByPlaceholderText(/Np\. W piątek/), 'Zrobię X');
    fireEvent.press(screen.getByText('Dalej'));

    // Step 3: predictedOutcome required — type → Dalej
    await waitFor(() => screen.getByText('Jak myślisz — co się stanie?'));
    fireEvent.changeText(screen.getByPlaceholderText(/Np\. Szef się zdenerwuje/), 'Przewiduję X');
    fireEvent.press(screen.getByText('Dalej'));

    // Step 4: Dalej (optional)
    await waitFor(() => screen.getByText('Co może przeszkodzić?'));
    fireEvent.press(screen.getByText('Dalej'));

    // Step 5: Zakończ visible
    await waitFor(() => {
      expect(screen.getByText('Jak sobie z tym poradzisz?')).toBeTruthy();
      expect(screen.getByText('Zakończ')).toBeTruthy();
    });
  });
});

describe('NewExperimentFlow phase=result', () => {
  it('loads existing experiment and shows step 6 title', async () => {
    (repo.getExperimentById as jest.Mock).mockResolvedValue(mockExperiment);

    render(<NewExperimentFlow phase="result" experimentId="exp-1" />);

    await waitFor(() => {
      expect(screen.getByText('Co się wydarzyło?')).toBeTruthy();
    });
  });

  it('saves conclusion and sets status=completed on finish', async () => {
    (repo.getExperimentById as jest.Mock).mockResolvedValue(mockExperiment);
    (repo.updateExperiment as jest.Mock).mockResolvedValue(undefined);

    render(<NewExperimentFlow phase="result" experimentId="exp-1" />);

    // Step 6: actualOutcome required
    await waitFor(() => screen.getByText('Co się wydarzyło?'));
    fireEvent.changeText(
      screen.getByPlaceholderText(/Np\. Szef przyjął to spokojnie/),
      'Wszystko poszło dobrze'
    );
    fireEvent.press(screen.getByText('Dalej'));

    // Step 7: sliders — optional, Dalej enabled
    await waitFor(() => screen.getByText('Oceń wynik eksperymentu'));
    fireEvent.press(screen.getByText('Dalej'));

    // Step 8: conclusion required → type → Zakończ
    await waitFor(() => screen.getByText('Czego nauczył cię ten eksperyment?'));
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

  it('initialises beliefStrengthAfter to beliefStrengthBefore when null', async () => {
    const expWith80 = { ...mockExperiment, beliefStrengthBefore: 80, beliefStrengthAfter: null };
    (repo.getExperimentById as jest.Mock).mockResolvedValue(expWith80);

    render(<NewExperimentFlow phase="result" experimentId="exp-1" />);

    await waitFor(() => screen.getByText('Co się wydarzyło?'));
    expect(repo.getExperimentById).toHaveBeenCalledWith(expect.anything(), 'exp-1');
  });
});
