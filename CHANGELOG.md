# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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

[Unreleased]: https://github.com/Konstantysz/cbt-toolkit-app/compare/v0.2.0...HEAD
[v0.2.0]: https://github.com/Konstantysz/cbt-toolkit-app/compare/v0.1.1...v0.2.0
[v0.1.1]: https://github.com/Konstantysz/cbt-toolkit-app/compare/v0.1.0...v0.1.1
[v0.1.0]: https://github.com/Konstantysz/cbt-toolkit-app/releases/tag/v0.1.0
