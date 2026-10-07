# PRD — core-ui deepening (mudguard gen 1)

Base: `0aee35bc343619810fc170092413ee5790e32713` (origin/main)
Area paths: `src/core/components/ src/core/theme/ src/core/i18n/ components/ constants/`

## Problem

`src/core/components` has good primitives (SearchBar, StepProgress, IntensitySlider…), but the UI shared by every tool — the tool-stack header, the entry list screen, status badges, the confirm-delete button, multiline inputs — was copied into each tool or route instead. The copies have drifted: some use theme tokens, others hard-code `rgba(...)` literals that match only the default warm-dark palette. Separately, an unused Expo template (`components/`, `constants/`) carries a second, dead theming system.

## Candidates

| # | Issue | Strength |
|---|---|---|
| 01 | [Delete unused Expo template `components/` + `constants/`](issues/01-delete-expo-template.md) | Strong |
| 02 | [Shared tool-stack header](issues/02-tool-stack-header.md) | Strong |
| 03 | [`ConfirmDeleteButton`](issues/03-confirm-delete-button.md) | Worth-exploring |
| 04 | [Shared entry list screen](issues/04-entry-list-screen.md) | Strong |
| 05 | [`StatusBadge` primitive](issues/05-status-badge.md) | Strong |
| 06 | [`MultilineField`](issues/06-multiline-field.md) | Worth-exploring |

Merged in from other areas: `app-routes` "shared tool-stack layout" → **02**; `tools` "entry list screen shell + status badge" → **04** / **05**.

## Cross-cutting hazard: literal colours vs theme tokens

Several tool screens hard-code `rgba` values equal to warm-dark *default* tokens (`rgba(122,158,126,0.12)` = `successDim`, `rgba(184,151,74,0.1)` = `inProgressDim`, `rgba(196,96,90,0.22)` = `dangerBorder`) while sibling screens use the tokens. Behaviour-preserving extraction keeps the literals in the new component (or exposes an override); switching to tokens is a **visible fix** in other palettes/modes and belongs in its own commit. The "example" tone and BE's blue "planned" fill (`rgba(108,142,239,0.12)` under brown accent text) have no token at all. Related bug-hunt item (not a deepening): `StepProgress.tsx:25` and `CompareScreen.tsx:195` hard-code `rgba(196,149,106,0.35)` (= `accentSubtle` only in warm-dark dark).

## Out of scope

- Wizard nav-row footer — layouts genuinely differ.
- `createThemedStyles` factory — 2 lines per site, no seam.
- `AbcGraph` SVG colours — single adapter.
- `pl.ts` duplicates (`'Brak wpisów'`, `'Narzędzia'`) — a `/copy` concern; partly fixed by 02 and 04.
- Replacing magic numbers with spacing/typography tokens — churn, not depth.

## Rejected at verification

None. (03 downgraded Strong → Worth-exploring: the verifier kept it Strong but called it borderline, and an independent proposer judged it shallow — interface of ~5 strings + callback for ~35 lines.)
