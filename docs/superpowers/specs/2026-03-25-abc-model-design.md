# ABC Model — Design Spec

**Date:** 2026-03-25
**Tool ID:** `abc-model`
**Status:** Approved, ready for implementation

---

## Overview

Model ABC (znany też jako "hot cross bun") to klasyczne narzędzie CBT pokazujące wzajemne powiązania między sytuacją, myślami i konsekwencjami (emocje, zachowanie, objawy fizjologiczne). Narzędzie składa się z 2-krokowego formularza i widoku szczegółu z graficzną wizualizacją modelu.

---

## Data Model

### Type: `AbcEntry`

```ts
interface AbcEntry {
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
```

### Database

- Tabela: `abc_entries`
- Migracja: `001-create-abc-entries.ts`
- Emocje jako `TEXT` (swobodny tekst, nie tablica jak w thought-record)
- Brak pola `situationDate` — wpis identyfikowany przez `createdAt`

---

## Screens

### 1. AbcListScreen

- Lista wpisów posortowana od najnowszego
- Karta wpisu: data + pierwsze ~80 znaków pola `situation` jako preview
- Badge: "Kompletny" / "W toku"
- Wyszukiwarka filtrująca po `situation`
- Seed przykładowy (`isExample: true`) przy pierwszym uruchomieniu
- FAB / przycisk "Nowy wpis" → NewAbcFlow

### 2. NewAbcFlow

Dwukrokowy guided flow, reużywa `StepProgress` z `core/components`.

**Krok 1 — A + B:**
- StepProgress: 1/2
- Pole tekstowe: "Co się wydarzyło?" (`situation`)
- Pole tekstowe: "Co wtedy myślałeś?" (`thoughts`)
- StepHelper: krótkie wyjaśnienie modelu ABC
- Przycisk "Dalej" → auto-save (`isComplete: false`, `currentStep: 1`)

**Krok 2 — C (trzy pola):**
- StepProgress: 2/2
- Pole tekstowe: "Co zrobiłeś?" (`behaviors`)
- Pole tekstowe: "Co czułeś?" (`emotions`)
- Pole tekstowe: "Jak reagowało twoje ciało?" (`physicalSymptoms`)
- StepHelper: wyjaśnienie "hot cross bun" — wzajemnego wpływu C
- Przycisk "Zapisz" → auto-save (`isComplete: true`, `currentStep: 2`) → navigate do detail

**Edit mode:** ten sam flow z `existingId` prop, dane pre-fillowane.

### 3. AbcDetailScreen

Dwie strefy w ScrollView:

**Strefa 1 — Graf SVG (~280px wysokości):**

Węzły (react-native-svg):
- A (Sytuacja) — góra, centrum X
- B (Myśli) — środek diagramu
- C1 (Zachowanie) — środek-lewo
- C2 (Emocje) — środek-prawo
- C3 (Objawy Fizjologiczne) — dół, centrum X

Każdy węzeł zawiera:
- Etykietę (np. "Myśli")
- Pierwsze ~40 znaków tekstu użytkownika, obcięte z `…`

Strzałki:
- A → B: prosta strzałka w dół (jednostronna)
- B ↔ C1: prosta strzałka (obustronna)
- B ↔ C2: prosta strzałka (obustronna)
- B ↔ C3: prosta strzałka (obustronna)
- C1 ↔ C2: krzywa strzałka (obustronna, górny łuk)
- C1 ↔ C3: krzywa strzałka (obustronna, lewy łuk)
- C2 ↔ C3: krzywa strzałka (obustronna, prawy łuk)

Graf jest statyczny (bez interakcji tap).

**Strefa 2 — Pełne teksty (pod grafem):**

Sekcje z etykietą i pełną treścią:
- A — Sytuacja
- B — Myśli
- C1 — Zachowanie
- C2 — Emocje
- C3 — Objawy Fizjologiczne

**Przyciski akcji (dół):** Edytuj + Usuń (identyczny pattern co thought-record i behavioral-experiment)

---

## File Structure

```
src/tools/abc-model/
  index.ts                        # ToolDefinition rejestracja
  types.ts                        # AbcEntry interface
  repository.ts                   # CRUD operacje na expo-sqlite
  migrations/
    001-create-abc-entries.ts
  hooks/
    useAbcEntries.ts              # lista
    useAbcEntry.ts                # single
  screens/
    AbcListScreen.tsx
    NewAbcFlow.tsx
    AbcDetailScreen.tsx
  components/
    AbcGraph.tsx                  # SVG "hot cross bun" (react-native-svg)
  i18n/
    pl.ts                         # wszystkie polskie stringi

src/app/(tools)/abc-model/
  index.tsx                       # → AbcListScreen
  new.tsx                         # → NewAbcFlow
  [id]/
    index.tsx                     # → AbcDetailScreen
    edit.tsx                      # → NewAbcFlow (existingId)
```

---

## Component: AbcGraph

Osobny komponent `AbcGraph.tsx` przyjmujący:

```ts
interface AbcGraphProps {
  situation: string;
  thoughts: string;
  behaviors: string;
  emotions: string;
  physicalSymptoms: string;
}
```

Implementacja z `react-native-svg` (dostępna w Expo SDK 52).
Tekst w węzłach: obcięty do ~40 znaków z `…` jeśli dłuższy.
Kolory węzłów: zgodne z motywem aplikacji (`colors` z `core/theme`).

---

## Graph node colors (per diagram reference)

| Węzeł | Kolor etykiety |
|-------|---------------|
| A — Sytuacja | `colors.accent` (złoty) |
| B — Myśli | zielonkawy (`#7a9e7e`) |
| C1 — Zachowanie | fioletowy (`#9e7ab5`) |
| C2 — Emocje | różowy (`#c46a8a`) |
| C3 — Objawy | różowy (`#c46a8a`) |

---

## UI Notes

- Używać `frontend-design` skill przy implementacji ekranów
- Styl ciemny (dark-only, jak reszta aplikacji)
- `AbcGraph` powinien ładnie wyglądać także gdy pola są puste (węzły z samą etykietą)
- Lista: identyczny pattern co `RecordListScreen`
- Detail: identyczny pattern przyciski co `ExperimentDetailScreen`

---

## Testing

- Repository: testy jednostkowe CRUD (wzorzec z `thought-record/repository.test.ts`)
- Hooks: testy renderowania i filtrowania (wzorzec z `useThoughtRecords.test.ts`)
- `AbcGraph`: snapshot test + test że tekst jest obcinany do 40 znaków
- `NewAbcFlow`: test auto-save po kroku 1, test kompletnego flow
