# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [v0.4.1] - 2026-03-28

### Added

- **CI/CD quality gates**
  - CI now triggers on `push` to `main` in addition to PRs
  - Jest coverage thresholds enforced: statements 65%, branches 55%, functions 58%, lines 68%
  - Coverage report uploaded as CI artifact (14-day retention)
  - Prettier added — `format:check` gate in CI, `format` script for local use
  - CI split into 4 parallel jobs: Lint & Format, Typecheck, Tests & Coverage, Expo Export
- **Pre-commit hook** (husky + lint-staged) — auto-runs `prettier --write` + `eslint --fix` on staged `src/**/*.{ts,tsx}` before every commit

### Changed

- **Brain migrated to [BrainTree](https://github.com/brain-tree-dev/brain-tree-os)** — project knowledge base moved from Obsidian vault to `~/brains/cbt-toolkit-app/`
  - `/resume` and `/wrap-up` commands removed — replaced by `/resume-braintree` and `/wrap-up-braintree`
  - `.claude/commands/` updated with new brain paths (`adr`, `copy`, `spec`, `new-tool`)
  - `CLAUDE.md` updated to reflect new brain location and commands

### Fixed

- **ABC Model detail screen** — SVG graph now renders correctly in production APK builds
  - Root cause: `react-native-svg` `Defs`/`Marker` with `url(#id)` references fail in release builds
  - Fix: replaced marker-based arrowheads with inline `<Path>` elements computed from line angles
- **Thought Record form screen** — header no longer shows raw route path `[id]/form`
  - Root cause: `Stack.Screen` for `[id]/form` was missing from `thought-record/_layout.tsx`
  - Fix: added explicit screen registration with title `Formularz Zapisu Myśli`

---

## [v0.4.0]

### Added

- **ABC Model tool** — third CBT module, fully self-contained
  - 2-step form: activating event (A), belief (B), consequences (C1 emotional / C2 behavioral)
  - ABCGraph — SVG visualization of A → B → C1/C2 relationships with curved arrows
  - List with search/filter, detail screen, edit and delete
- **Thought Record paper form view + export**
  - Paper form screen accessible from RecordDetailScreen via "Formularz" button
  - Export as PDF (`expo-print`) or PNG (`react-native-view-shot`) shared via native share sheet
- **Thought Record step 1 hint** extended with HALT mnemonic and recurrence prompt
- **Behavioral Experiment redesign** — replaced original flow with structured CBT format
  - 5 plan steps: belief + strength (0–100), alternative belief, experiment plan, prediction, safety behaviours + scheduled date
  - 3 result steps: execution date, actual outcome, belief strength after + reflection
  - `beliefStrengthBefore` / `beliefStrengthAfter` sliders replace generic intensity
- **Home screen redesign** — 2-column square tile grid
  - Large Ionicons icon (52px, accent color) + tool name per tile
  - Accent top border on each card; ScrollView replaces FlatList
- **Icon library** — replaced all Unicode symbols (`⊞`, `✏`, `◻`) with `@expo/vector-icons` Ionicons across all tool screens
  - `accessible={false}` on decorative icons; `accessibilityLabel` on all action buttons
- **SearchBar shared component** (`core/components/SearchBar`) — used by all three tool list screens
- **CI**: `npx expo install --check` step added to catch incompatible dependency bumps on PRs

### Fixed

- `package.json` dependency specs corrected — reverted incompatible bumps to Expo SDK 55 compatible versions
- `.npmrc` added with `legacy-peer-deps=true` — clean installs after `node_modules` wipe now work
- `thought-record` icon `brain` → `journal-outline` (invalid Ionicons name caused black screen on home)
- Home screen navigation: `router.push` → `router.navigate` — fixed SQLiteContext crash on tool open
- Behavioral Experiment detail screen: intensity slider now read-only (`pointerEvents="none"`)
- Behavioral Experiment: StepHelper moved below TextInput in all 7 steps (was obscuring input)
- Behavioral Experiment: "% po" field no longer copies "% przed" value on open

---

## [v0.3.0]

### Added

- **Settings screen** — platform features accessible from the bottom tab bar
  - Notification reminder — daily push notification with configurable time
  - Font size selector — Small / Medium / Large, applied app-wide via `scaledFont()`
  - Reduced motion toggle
  - High contrast mode toggle (alternate color palette via `useColors()`)
  - Data export — full JSON backup (including settings) shared via native share sheet
  - Data import — restore from JSON file with validation and duplicate-skip logic; settings restored if present
  - Delete all data — two-step confirmation dialog
  - Credits screen (static)
  - Bibliography screen (static)
- **Settings store** — Zustand + AsyncStorage persist middleware; all preferences survive app restart
- **App launch notification sync** — reminder rescheduled on boot if enabled, always in sync with stored time
- **Behavioral Experiment tool** — second CBT module, fully self-contained
  - 7-step plan phase: belief + intensity, prediction, experiment design, safety behaviours check, scheduled date
  - Result phase: actual outcome, belief intensity after, reflection
  - Status transitions: `planned` → `completed` / `abandoned`
  - Experiment list with status badges and date
  - Experiment detail screen (read-only) with belief comparison card
  - Edit and delete with confirmation dialog
- **StepHelper** promoted to `core/components` — shared across all tools
- **StepProgress** promoted to `core/components` — shared across all tools
- **useFocusEffect** data refresh — list screens reload on focus (no stale data after edit/delete)
- **GitHub repo hygiene** — issue templates (bug report, feature request), PR template, Dependabot (weekly npm, grouped)
- **CI workflow** — lint + typecheck + test + `expo export` on every PR to main
- **ESLint** — `eslint-config-expo` (flat config), 0 errors, 0 warnings

### Changed

- `android.package` corrected: `com.anonymous.cbttoolkitapp` → `com.cbttoolkit.app`
- StepHelper redesigned as pill with chevron ▾/▴ indicator; hint panel renders above toggle
- Edit and Delete buttons unified to bottom action row in both detail screens (thought-record + behavioral-experiment)
- List screens: spinner only shown when list is empty (not on every refresh)

### Fixed

- N+1 database inserts during import wrapped in single `withTransactionAsync` transaction
- iOS time picker (`display="spinner"`) no longer calls notification API on every wheel tick — commits only on "Gotowe"
- Notification sync on boot: removed stale `scheduled.length === 0` guard; always reschedules when enabled
- Zustand store restructured from monkey-patched `setState` to standard `(set) => ({...})` initializer pattern
- Badge and emotion tag vertical centering on Android (`View` wrapper + `includeFontPadding: false`)
- Intensity bars right-aligned in RecordDetailScreen
- `behavioral-experiment` route hidden from tab bar (`href: null`)
- Hint panel previously hidden outside ScrollView visible area

---

## [v0.2.0]

### Added

- **Emotion comparison** — side-by-side before/after view across 4 pages (RecordDetailScreen → Compare)
- **Edit mode** — re-open any completed record in the 7-step flow and update it
- **Search & filter** — real-time search across situation text and emotion names in the record list
- **Onboarding seed** — example thought record inserted automatically on first launch
- **Step hints** — collapsible hint panel (StepHelper) in steps 1, 3, 4, 5, 6 of the flow
- **Back navigation** — "← Narzędzia" breadcrumb button on the record list screen
- **Example badge** — seed records are marked with a distinct "Przykład" badge

### Changed

- Dark theme applied to all Stack navigator headers
- Home screen redesigned: app title, section label, improved tool cards with accent bar
- Safe area handling added (camera island / notch support via SafeAreaProvider)
- Tab bar icons updated to Ionicons (grid, settings)
- Emotion bars enhanced: 6px height, 120px track, intensity indicator

### Fixed

- `crypto.getRandomValues()` error on Android — replaced `uuid` with `expo-crypto`
- Routing warning for `[id]` — corrected to `[id]/index` in Stack layout
- `(tools)/thought-record` appearing as a third tab — hidden via `href: null`
- Compare and Edit screen headers showing raw route name

---

## [v0.1.1]

### Changed

- Moved `Emotion` type from `tools/thought-record/types` to `core/types` — shared infrastructure cleanup

---

## [v0.1.0]

### Added

- **Thought Record tool** — first CBT module, fully self-contained
- **7-step guided flow** (NewRecordFlow):
  1. Situation + date
  2. Emotions before (picker + intensity slider 0–100)
  3. Automatic thoughts
  4. Evidence for the thought
  5. Evidence against the thought
  6. Alternative thought
  7. Emotions after (re-rating)
- **Auto-save** — progress persisted to SQLite at each step
- **Record list** (RecordListScreen) — browse all saved records with status badges
- **Record detail** (RecordDetailScreen) — read-only view of a completed record
- **Delete** — with confirmation dialog
- **EmotionPicker** shared component (TDD, 3 tests)
- **IntensitySlider** shared component (TDD, 2 tests)
- **SQLite database** — expo-sqlite with migration runner
- **Tool registry** — modular plugin architecture (ToolDefinition interface)
- **Dark theme** — warm dark palette with amber accent
- **Jest test infrastructure** — jest-expo + @testing-library/react-native

[Unreleased]: https://github.com/Konstantysz/cbt-toolkit-app/compare/v0.4.1...HEAD
[v0.4.1]: https://github.com/Konstantysz/cbt-toolkit-app/compare/v0.4.0...v0.4.1
[v0.4.0]: https://github.com/Konstantysz/cbt-toolkit-app/compare/v0.3.0...v0.4.0
[v0.3.0]: https://github.com/Konstantysz/cbt-toolkit-app/compare/v0.2.0...v0.3.0
[v0.2.0]: https://github.com/Konstantysz/cbt-toolkit-app/compare/v0.1.1...v0.2.0
[v0.1.1]: https://github.com/Konstantysz/cbt-toolkit-app/compare/v0.1.0...v0.1.1
[v0.1.0]: https://github.com/Konstantysz/cbt-toolkit-app/releases/tag/v0.1.0
