export type ExperimentStatus = 'planned' | 'completed';

export interface BehavioralExperiment {
  id: string;
  status: ExperimentStatus;

  // Plan phase
  belief: string;
  beliefStrengthBefore: number;       // 0–100
  alternativeBelief: string;
  plan: string;
  predictedOutcome: string;

  // Result phase
  executionDate: string | null;       // ISO date string
  executionNotes: string | null;      // what the user actually did (step 5)
  actualOutcome: string | null;       // what happened (step 6)
  conclusion: string | null;          // learnings (step 7)
  beliefStrengthAfter: number | null; // 0–100

  isExample: boolean;
  createdAt: string;
  updatedAt: string;
}
