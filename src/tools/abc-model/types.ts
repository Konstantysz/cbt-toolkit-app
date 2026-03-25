export interface AbcEntry {
  id: string;
  situation: string;        // A — Co się wydarzyło?
  thoughts: string;         // B — Co wtedy myślałeś?
  behaviors: string;        // C1 — Co zrobiłeś?
  emotions: string;         // C2 — Co czułeś?
  physicalSymptoms: string; // C3 — Jak reagowało twoje ciało?
  isComplete: boolean;
  isExample: boolean;
  currentStep: number;      // 1 | 2
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}
