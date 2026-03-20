import type { Emotion } from '../../core/types';
export type { Emotion };

export interface ThoughtRecord {
  id: string;
  situation: string;
  situationDate: string | null;
  emotions: Emotion[];
  automaticThoughts: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  outcome: string | null;
  isComplete: boolean;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}
