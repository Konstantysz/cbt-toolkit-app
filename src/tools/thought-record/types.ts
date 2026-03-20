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

export interface Emotion {
  name: string;
  intensityBefore: number;  // 0-100
  intensityAfter?: number;  // 0-100
}
