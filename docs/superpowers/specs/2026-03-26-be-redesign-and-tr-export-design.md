# Design: BE Redesign + Thought Record Export

**Date:** 2026-03-26
**Session:** 028
**Scope:** Two independent features in one session

---

## Feature 1: Behavioral Experiment — Classic Form Redesign

### Goal

Przerobić narzędzie "Eksperyment Behawioralny" tak, żeby odpowiadało klasycznemu papierowemu formularzowi CBT (6-kolumnowa tabela). Brak wstecznej kompatybilności — czyste cięcie.

### New Data Model

```ts
BehavioralExperiment {
  // meta (bez zmian)
  id: string
  status: 'planned' | 'completed'
  isExample: boolean
  createdAt: string
  updatedAt: string

  // Plan phase (5 kroków)
  belief: string              // Weryfikowana myśl
  plan: string                // Eksperyment — co konkretnie zrobisz
  predictedOutcome: string    // Przewidywana reakcja
  potentialProblems: string   // Potencjalne problemy
  problemStrategies: string   // Strategie rozwiązania problemów

  // Result phase (3 kroki)
  actualOutcome: string | null        // Wynik eksperymentu
  confirmationPercent: number | null  // 0–100%: w jakim stopniu potwierdza myśl
  conclusion: string | null           // Czego nauczył mnie ten eksperyment
}
```

**Usunięte pola (względem poprzedniej wersji):**
- `alternativeBelief`
- `beliefStrengthBefore`
- `beliefStrengthAfter`
- `executionDate`
- `executionNotes`

### Database Migration

`migrations/002-recreate-behavioral-experiments.ts`

```sql
DROP TABLE IF EXISTS behavioral_experiments;
CREATE TABLE behavioral_experiments (
  id                   TEXT PRIMARY KEY,
  status               TEXT NOT NULL DEFAULT 'planned',
  belief               TEXT NOT NULL DEFAULT '',
  plan                 TEXT NOT NULL DEFAULT '',
  predicted_outcome    TEXT NOT NULL DEFAULT '',
  potential_problems   TEXT NOT NULL DEFAULT '',
  problem_strategies   TEXT NOT NULL DEFAULT '',
  actual_outcome       TEXT,
  confirmation_percent INTEGER,
  conclusion           TEXT,
  is_example           INTEGER NOT NULL DEFAULT 0
);
```

Migracja jest destruktywna — wszystkie istniejące eksperymenty zostają usunięte.

### Step Flow

#### Plan phase (5 kroków)

| Krok | Pole | Tytuł | Wymagane |
|---|---|---|---|
| 1 | `belief` | Jaką myśl chcesz zweryfikować? | tak |
| 2 | `plan` | Co konkretnie zrobisz? | tak |
| 3 | `predictedOutcome` | Jak myślisz — co się stanie? | nie |
| 4 | `potentialProblems` | Co może przeszkodzić? | nie |
| 5 | `problemStrategies` | Jak sobie z tym poradzisz? | nie |

#### Result phase (3 kroki)

| Krok | Pole | Tytuł | Wymagane |
|---|---|---|---|
| 1 | `actualOutcome` | Co się wydarzyło? | tak |
| 2 | `confirmationPercent` | W jakim % potwierdza to twoją myśl? | nie |
| 3 | `conclusion` | Czego nauczył cię ten eksperyment? | tak |

### ExperimentDetailScreen (sekcje)

```
Weryfikowana myśl: [belief]

──────────── PLAN ────────────
Eksperyment:           [plan]
Przewidywana reakcja:  [predictedOutcome]
Potencjalne problemy:  [potentialProblems]
Strategie:             [problemStrategies]

──────────── WYNIK ───────────
Co się wydarzyło:      [actualOutcome]
% potwierdzenia:       [bar: confirmationPercent%]
Czego się nauczyłem:   [conclusion]

[ Edytuj ]  [ Usuń ]
```

### Seed Example

Zaktualizowany przykładowy eksperyment pasujący do nowego schematu.

---

## Feature 2: Thought Record — Paper Form View + Export

### Goal

Nowy ekran `RecordFormScreen` odwzorowujący papierowy formularz "Formularza Zapisu Myśli". Dostępny z `RecordDetailScreen`. Eksport do PDF i PNG.

### Form Layout

```
FORMULARZ ZAPISU MYŚLI
────────────────────────── (linia akcentu #C4956A)

SYTUACJA
[situation text]

EMOCJE PRZED
[emotion name]  [intensityBefore]%
...

┌───────────────┬───────────────┬───────────────┐
│ MYŚL          │ DOWODY        │ DOWODY        │
│ AUTOMATYCZNA  │ POTWIERDZAJĄCE│ PRZECZĄCE     │
│               │               │               │
│ [automatic    │ [evidenceFor] │ [evidenceA-   │
│  Thoughts]    │               │  gainst]      │
└───────────────┴───────────────┴───────────────┘

MYŚLI ALTERNATYWNE
[alternativeThought]

EMOCJE PO
[emotion name]  [intensityAfter]%  (↓ jeśli poprawa)
...
```

### Style eksportowanego formularza

- Tło: białe `#FFFFFF`
- Tekst: czarny `#111111`
- Etykiety sekcji: uppercase, mały rozmiar, kolor `#C4956A`
- Obramowania tabeli: cienkie, `#999999`
- Font: systemowy szeryfowy lub sans-serif
- Bez ikon, bez ozdób — minimalistyczny, czytelny

### Export Options

**PDF** — `expo-print` (już w Expo SDK, zero nowych zależności)
- `Print.printToFileAsync({ html })` → tymczasowy plik PDF
- `Sharing.shareAsync(uri)`

**PNG** — `react-native-view-shot` (nowa zależność, dev build only)
- `captureRef(ref)` → PNG w temp dir
- `Sharing.shareAsync(uri)`

Dwa osobne przyciski na `RecordFormScreen`: "Eksportuj PDF" i "Eksportuj PNG".

### Navigation

- Nowy route: `src/app/(tools)/thought-record/[id]/form.tsx`
- Nowy screen: `src/tools/thought-record/screens/RecordFormScreen.tsx`
- `RecordDetailScreen` — dodać przycisk "Formularz" (obok "Porównaj")

### i18n keys (nowe)

```ts
form: {
  title: 'Formularz Zapisu Myśli',
  sections: {
    situation: 'Sytuacja',
    emotionsBefore: 'Emocje przed',
    automaticThought: 'Myśl automatyczna',
    evidenceFor: 'Dowody potwierdzające',
    evidenceAgainst: 'Dowody przeczące',
    alternativeThought: 'Myśli alternatywne',
    emotionsAfter: 'Emocje po',
  },
  export: {
    pdf: 'Eksportuj PDF',
    png: 'Eksportuj PNG',
    errorTitle: 'Błąd eksportu',
    errorMsg: 'Nie udało się wyeksportować formularza. Spróbuj ponownie.',
  },
}
```

---

## Files Changed / Created

### Feature 1 (BE Redesign)

| Plik | Zmiana |
|---|---|
| `src/tools/behavioral-experiment/types.ts` | nowy model |
| `src/tools/behavioral-experiment/migrations/002-recreate-behavioral-experiments.ts` | DROP + CREATE |
| `src/tools/behavioral-experiment/repository.ts` | nowe pola |
| `src/tools/behavioral-experiment/hooks/useBehavioralExperiments.ts` | bez zmian (prawdopodobnie) |
| `src/tools/behavioral-experiment/screens/NewExperimentFlow.tsx` | 5 kroków plan + 3 result |
| `src/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx` | nowe sekcje |
| `src/tools/behavioral-experiment/i18n/pl.ts` | nowe klucze |
| `src/tools/behavioral-experiment/__tests__/*` | zaktualizowane testy |

### Feature 2 (TR Export)

| Plik | Zmiana |
|---|---|
| `src/tools/thought-record/screens/RecordFormScreen.tsx` | nowy |
| `src/tools/thought-record/i18n/pl.ts` | nowe klucze `form.*` |
| `src/tools/thought-record/screens/RecordDetailScreen.tsx` | przycisk "Formularz" |
| `src/app/(tools)/thought-record/[id]/form.tsx` | nowy route |

### New dependency

`react-native-view-shot` — wymagany do eksportu PNG.

---

## Out of Scope

- Podgląd formularza przed eksportem (pełnoekranowy) — to jest sam `RecordFormScreen`
- Zmiana historii eksperymentów po migracji — brak backward compat świadoma decyzja
- Eksport eksperymentów behawioralnych — tylko Thought Record w tej sesji
- Light theme
