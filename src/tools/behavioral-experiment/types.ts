export type ExperimentStatus = 'planned' | 'completed';

export interface BehavioralExperiment {
  id: string;
  status: ExperimentStatus;

  // Plan phase (5 kroków)
  belief: string; // Weryfikowana myśl
  beliefStrengthBefore: number; // 0–100, jak mocno wierzysz przed eksperymentem
  plan: string; // Eksperyment — co zrobisz
  predictedOutcome: string; // Przewidywana reakcja
  potentialProblems: string; // Potencjalne problemy
  problemStrategies: string; // Strategie rozwiązania problemów

  // Result phase (3 kroki)
  executionDate: string | null; // ISO date string
  actualOutcome: string | null; // Wynik eksperymentu
  confirmationPercent: number | null; // 0–100%
  beliefStrengthAfter: number | null; // 0–100, jak mocno wierzysz po eksperymencie
  conclusion: string | null; // Czego nauczył mnie eksperyment

  isExample: boolean;
  createdAt: string;
  updatedAt: string;
}
