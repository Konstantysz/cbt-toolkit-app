export interface AbcEntry {
  id: string;
  situation: string;        // A — triggering event
  thoughts: string;         // B — automatic beliefs/thoughts
  behaviors: string;        // C1 — behavioral response
  emotions: string;         // C2 — emotional response
  physicalSymptoms: string; // C3 — physiological response
  isComplete: boolean;
  isExample: boolean;
  currentStep: 1 | 2;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}
