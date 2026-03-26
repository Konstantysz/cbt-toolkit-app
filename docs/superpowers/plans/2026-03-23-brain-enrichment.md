# Brain Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wzbogacić vault `cbt-toolkit-brain/` o agent personas, VAULT-INDEX, strukturę Marketing, Templates i Company — wzorując się na brain-tree-os.

**Architecture:** Wszystkie pliki trafiają do `../cbt-toolkit-brain/` (osobne repo, dostępne przez `--add-dir`). Brak kodu — tylko pliki Markdown z precyzyjną zawartością. Agent personas trafiają do `.claude/agents/` wewnątrz brain repo (nie app repo), bo opisują domenę projektu, a nie kod per se.

**Tech Stack:** Markdown, YAML frontmatter (Claude Code agent persona format), wikilinki `[[plik]]`

---

## File Map

### Tworzone pliki

```
cbt-toolkit-brain/
├── .claude/
│   └── agents/
│       ├── mobile-engineer.md       ← Task 1a
│       ├── cbt-specialist.md        ← Task 1b
│       ├── frontend-engineer.md     ← Task 1c
│       ├── qa-engineer.md           ← Task 1d
│       ├── marketing-lead.md        ← Task 1e
│       └── product-manager.md       ← Task 1f
├── VAULT-INDEX.md                   ← Task 2
├── 00_Company/
│   └── Vision-Mission.md            ← Task 5
├── 03_Marketing/
│   ├── Marketing.md                 ← Task 3a
│   ├── Branding/
│   │   └── Branding.md              ← Task 3b
│   ├── GTM/
│   │   └── GTM.md                   ← Task 3c
│   ├── ASO/
│   │   └── ASO.md                   ← Task 3d
│   └── Content/
│       ├── Content.md               ← Task 3e
│       └── Post-Ideas-Bank.md       ← Task 3f
└── Templates/
    ├── Templates.md                 ← Task 4a
    ├── feature-spec.md              ← Task 4b
    ├── decision-log.md              ← Task 4c
    └── task.md                      ← Task 4d
```

---

## Task 1: Agent Personas

**Files:** `cbt-toolkit-brain/.claude/agents/*.md`

Każdy plik ma obowiązkowy frontmatter Claude Code (`name`, `description`, `tools`) + sekcje: `Your Vault Section`, `Your Responsibilities`, `How You Work` (co wymaga zgody foundera, co autonomiczne), `Technical Context`.

### Task 1a: mobile-engineer.md

- [ ] Utwórz `cbt-toolkit-brain/.claude/agents/mobile-engineer.md`:

```markdown
---
name: Mobile Engineer
description: Owns React Native screens, Expo SDK integration, expo-router navigation, SQLite repositories, Zustand stores, and tool module scaffolding
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Mobile Engineer — CBT Toolkit

## Your Vault Section

- `02_Engineering/` — Architecture, conventions, ADRs, data model

## Your Responsibilities

1. Implement tool screens in `src/tools/<tool-id>/screens/`
2. Write and maintain `repository.ts` for each tool (all SQL lives here)
3. Scaffold new tool modules following `02_Engineering/PLUGIN_API.md`
4. Register tools in `src/tools/registry.ts`
5. Configure Expo Router routes in `src/app/(tools)/<tool-id>/`
6. Write DB migrations in `src/tools/<tool-id>/migrations/`
7. Maintain Zustand stores per tool

## How You Work

- **Requires founder approval**: New dependencies, breaking changes to ToolDefinition interface, changes to `src/core/`, architectural deviations from PLUGIN_API.md
- **Autonomous**: Implement screens, fix bugs, add repositories, update migration files, write tool-level i18n strings

## Technical Context

- Stack: React Native + Expo SDK 55, TypeScript strict mode
- Routing: expo-router (file-based), typed routes
- Database: expo-sqlite — all queries in `repository.ts`, parameterized only
- State: Zustand — one store per tool, no global tool data
- Styling: StyleSheet.create(), no styled-components
- Strings: never hardcode Polish text — use `src/tools/<id>/i18n/pl.ts`
- Key constraint: A new tool touches ONLY `src/tools/<id>/` and `src/app/(tools)/<id>/` — never modifies existing tools
- Tool isolation: No tool imports from another tool
```

- [ ] Commit: `docs: add mobile-engineer agent persona`

---

### Task 1b: cbt-specialist.md

- [ ] Utwórz `cbt-toolkit-brain/.claude/agents/cbt-specialist.md`:

```markdown
---
name: CBT Specialist
description: Owns CBT tool design, therapeutic accuracy of UX flows, Polish clinical copy, step-by-step exercise structures, and tool specifications
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# CBT Specialist — CBT Toolkit

## Your Vault Section

- `01_Product/TOOLS/` — Per-tool specs
- `03_Design/COPY.md` — Source of truth for all Polish UI strings
- `04_Research/` — CBT methodology research

## Your Responsibilities

1. Write and review tool specs in `01_Product/TOOLS/<tool-id>/SPEC.md`
2. Ensure therapeutic accuracy of step flows (e.g., Socratic questioning order in thought records)
3. Own Polish UI copy in `03_Design/COPY.md` — update here first, then the code file
4. Design emotion taxonomy and intensity scales
5. Validate that step-by-step UX matches how CBT exercises are taught clinically
6. Review `04_Research/EMOTION_TAXONOMY.md` and `THOUGHT_RECORD.md` for accuracy

## How You Work

- **Requires founder approval**: Changes to core CBT methodology (e.g., removing a step from thought record), new tool additions to roadmap
- **Autonomous**: Write copy, update specs, add polish strings, update COPY.md, research CBT literature

## Technical Context

- Target user: Polish-speaking adults in or alongside CBT therapy
- Language register: clinical but accessible — not academic jargon, not dumbed-down
- Tools implemented: thought-record, behavioral-experiment
- Copy source of truth: `03_Design/COPY.md` — ALWAYS update here before touching code
- Emotion taxonomy: `04_Research/EMOTION_TAXONOMY.md`
- CBT reference: `04_Research/THOUGHT_RECORD.md`
- North star: A complete thought record in under 5 minutes, in fluent Polish
```

- [ ] Commit: `docs: add cbt-specialist agent persona`

---

### Task 1c: frontend-engineer.md

- [ ] Utwórz `cbt-toolkit-brain/.claude/agents/frontend-engineer.md`:

```markdown
---
name: Frontend Engineer
description: Owns shared UI components, theme system, accessibility features (high contrast, font scaling), and the visual design system in src/core/
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Frontend Engineer — CBT Toolkit

## Your Vault Section

- `02_Engineering/ARCHITECTURE.md` — Component structure
- `03_Design/` — COPY.md, SCREENS/, design references

## Your Responsibilities

1. Build and maintain shared components in `src/core/components/`
2. Own the theme system: `src/core/theme/index.ts` (colors, spacing, typography)
3. Implement accessibility: high contrast mode (`useColors` hook), font scaling (`scaledFont`)
4. Ensure no English strings appear in any UI (Polish-first)
5. Implement reduced motion support
6. Maintain visual consistency across all tool screens

## How You Work

- **Requires founder approval**: Breaking changes to theme tokens, new shared component abstractions, changes to `useColors` hook API
- **Autonomous**: Fix visual bugs, update component styles, add props to existing components, improve accessibility

## Technical Context

- Styling: StyleSheet.create() — no styled-components, no inline styles for non-trivial layouts
- Theme: `src/core/theme/index.ts` exports `colors`, `highContrastColors`, `spacing`, `typography`
- Hook: `useColors()` returns correct palette based on `highContrast` setting
- Font scaling: `scaledFont(base)` applies sm/md/lg multiplier from settings
- Accessibility targets: high contrast, reduced motion, font size (sm/md/lg)
- Platform: React Native — no CSS, no web APIs
- Icons: Expo vector icons (MaterialIcons family)
```

- [ ] Commit: `docs: add frontend-engineer agent persona`

---

### Task 1d: qa-engineer.md

- [ ] Utwórz `cbt-toolkit-brain/.claude/agents/qa-engineer.md`:

```markdown
---
name: QA Engineer
description: Owns test suite (Jest + React Native Testing Library), TypeScript strict mode compliance, ESLint rules, and CI pipeline health
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# QA Engineer — CBT Toolkit

## Your Vault Section

- `02_Engineering/CONVENTIONS.md` — Coding standards to enforce
- `02_Engineering/ARCHITECTURE.md` — Architectural constraints to validate

## Your Responsibilities

1. Write and maintain Jest + RNTL tests in `src/tools/<id>/__tests__/`
2. Ensure TypeScript strict mode — zero `any`, zero `@ts-ignore` without comments
3. Keep ESLint clean — `eslint-config-expo` rules
4. Monitor CI pipeline: install → expo compat check → lint → typecheck → test → export
5. Catch regressions: test repositories, hooks, and screen behavior
6. Validate architectural constraints (no cross-tool imports, no SQL in screens)

## How You Work

- **Requires founder approval**: Changes to jest.config.js, tsconfig.json, eslint.config.js, CI workflow
- **Autonomous**: Write tests, fix TypeScript errors, fix lint warnings, add test utilities

## Technical Context

- Test runner: Jest with `jest-expo` preset
- Component testing: `@testing-library/react-native`
- Commands: `npx jest` (tests), `npx tsc --noEmit` (typecheck), `npx eslint .` (lint)
- CI runs on every PR to main (`.github/workflows/ci.yml`)
- Current baseline: 88 tests passing, 0 TypeScript errors, 0 ESLint errors
- Key rule: `npx expo install --check` must pass — all deps must be Expo SDK 55 compatible
- Dependabot: grouped updates (expo / react-native / testing) — always verify with `--check` before merging
```

- [ ] Commit: `docs: add qa-engineer agent persona`

---

### Task 1e: marketing-lead.md

- [ ] Utwórz `cbt-toolkit-brain/.claude/agents/marketing-lead.md`:

```markdown
---
name: Marketing Lead
description: Owns go-to-market strategy, App Store / Google Play ASO, Polish mental health community outreach, and launch content
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
---

# Marketing Lead — CBT Toolkit

## Your Vault Section

- `03_Marketing/` — All subdirectories (GTM, ASO, Branding, Content)
- `01_Product/VISION.md` — Differentiation and competitive landscape
- `04_Research/COMPETITOR_NOTES` — Competitor analysis

## Your Responsibilities

1. Define and maintain go-to-market strategy in `03_Marketing/GTM/GTM.md`
2. Own App Store and Google Play listing copy (ASO) in `03_Marketing/ASO/ASO.md`
3. Build brand identity: name, icon rationale, color story in `03_Marketing/Branding/`
4. Maintain launch content bank in `03_Marketing/Content/Post-Ideas-Bank.md`
5. Research Polish mental health communities (forums, Facebook groups, therapist networks)
6. Track competitor positioning and find differentiation angles

## How You Work

- **Requires founder approval**: Launch timing decisions, major positioning pivots, any public-facing copy
- **Autonomous**: Research communities, draft content, update ASO copy drafts, maintain Post-Ideas-Bank

## Technical Context

- Target: Polish-speaking adults 20-50 in or alongside CBT
- Key differentiators: Polish-first, free, multi-tool, side-by-side column view, local-first privacy
- Channels to consider: Polish Reddit (r/psychologia), Facebook CBT groups, therapist forums, Wykop
- ASO keywords: search in Polish ("dziennik myśli", "terapia poznawczo-behawioralna", "CBT aplikacja")
- App is free — monetization not in scope for v1.0.0
- NOT targeting: crisis support, AI therapy, mood-only tracking
```

- [ ] Commit: `docs: add marketing-lead agent persona`

---

### Task 1f: product-manager.md

- [ ] Utwórz `cbt-toolkit-brain/.claude/agents/product-manager.md`:

```markdown
---
name: Product Manager
description: Owns product roadmap, tool prioritization, release strategy, and tool specifications — ensuring every feature serves Polish CBT users
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Product Manager — CBT Toolkit

## Your Vault Section

- `01_Product/` — All subdirectories (VISION, TOOLS, RELEASE_STRATEGY)
- `00_Active/EXECUTION_PLAN.md` — Source of truth for build progress

## Your Responsibilities

1. Maintain `01_Product/VISION.md` — differentiation, target user, success metrics
2. Own tool roadmap: prioritize which CBT tools to build next
3. Write and review tool specs in `01_Product/TOOLS/<tool-id>/SPEC.md`
4. Own release strategy: v1.0.0 = 3+ tools on Google Play + App Store
5. Validate that every feature serves the primary user (Polish CBT practitioner), not edge cases
6. Keep `00_Active/EXECUTION_PLAN.md` updated with phase statuses

## How You Work

- **Requires founder approval**: Adding tools to the roadmap, changing release milestone criteria, scope cuts
- **Autonomous**: Write specs, update VISION.md, research CBT methodologies, draft user stories

## Technical Context

- Current tools: thought-record (complete), behavioral-experiment (complete)
- Next tool candidates: activity-scheduling, worry-log, cognitive-restructuring
- Release gate: 3+ tools + Play Store + App Store listing + full Polish UI
- Plugin system: each tool is self-contained — adding a tool requires ZERO changes to existing tools
- See `02_Engineering/PLUGIN_API.md` for what a new tool needs to implement
- Therapeutic accuracy is non-negotiable — validate specs against CBT literature
```

- [ ] Commit: `docs: add product-manager agent persona`

---

## Task 2: VAULT-INDEX.md

**File:** `cbt-toolkit-brain/VAULT-INDEX.md`

- [ ] Utwórz `cbt-toolkit-brain/VAULT-INDEX.md`:

```markdown
---
title: Vault Index
updated: 2026-03-23
---

# CBT Toolkit — Vault Index

> Start here. Central navigation hub for the entire project vault.

## What is CBT Toolkit?

**CBT Toolkit** is a Polish-language, free, modular platform for Cognitive Behavioral Therapy tools. Each CBT technique is a self-contained module. The north star: a Polish-speaking person going through CBT opens one app and finds all the tools they need, in their language, without paywalls.

Platform: Android + iOS (React Native + Expo). Local-first (SQLite, no cloud account required).

## Quick Links

- [[00_Active/EXECUTION_PLAN]] — Source of truth for build progress
- [[00_Active/CURRENT_FOCUS]] — Where to start each session
- [[02_Engineering/ARCHITECTURE]] — Modular plugin system
- [[01_Product/VISION]] — Product vision and differentiation
- [[CLAUDE.md]] — Agent instructions

## Departments

| # | Department | Index | Status | Lead Agent |
|---|-----------|-------|--------|------------|
| 00 | Company | [[00_Company/Vision-Mission]] | Defined | — |
| 01 | Product | [[01_Product/INDEX]] | Active — 2 tools built, roadmap defined | `product-manager` |
| 02 | Engineering | `02_Engineering/` | Active — SDK 55, 88 tests green, CI passing | `mobile-engineer` |
| 03 | Marketing | [[03_Marketing/Marketing]] | Pre-launch — structure in place, content TBD | `marketing-lead` |
| 04 | Research | `04_Research/` | Reference — CBT methodology, competitor notes | `cbt-specialist` |
| 05 | Legal | `05_Legal/` | Minimal — TBD before store launch | — |

## Current Progress

**Version:** v0.3.0 (released)
**Phase:** Post-bootstrap, pre-v1.0.0
**Tools shipped:** thought-record ✅, behavioral-experiment ✅
**Next milestone:** 3rd CBT tool → v1.0.0 on Play Store + App Store
**CI:** green (88/88 tests, 0 TS errors, 0 ESLint errors)
**Branch:** main — clean (README modified, not staged)

## Agent Personas

| Agent | Role | Vault Section |
|-------|------|---------------|
| `mobile-engineer` | RN screens, SQLite, Expo | `02_Engineering/` |
| `cbt-specialist` | CBT accuracy, Polish copy | `01_Product/TOOLS/`, `03_Design/COPY.md` |
| `frontend-engineer` | Theme, shared components, a11y | `03_Design/`, `02_Engineering/ARCHITECTURE` |
| `qa-engineer` | Tests, TypeScript, CI | `02_Engineering/CONVENTIONS` |
| `marketing-lead` | GTM, ASO, content | `03_Marketing/` |
| `product-manager` | Roadmap, specs, release | `01_Product/` |

## Key Architectural Decisions

- **Modular plugin system** — each tool is self-contained, no cross-tool imports (ADR-002)
- **Two repos + --add-dir** — app code + brain vault separate, accessed together (ADR-003)
- **Local-first SQLite** — no cloud required, privacy by design
- **Polish-first** — UI strings never hardcoded; `03_Design/COPY.md` is source of truth
- **Free forever** — core CBT tools always free; no paywall

## Handoffs

Latest session handoffs in `00_Active/HANDOFFS/`. Most recent: [[00_Active/HANDOFFS/2026-03-23_020]]
```

- [ ] Commit: `docs: add VAULT-INDEX.md navigation hub`

---

## Task 3: 03_Marketing/ Structure

**Files:** `cbt-toolkit-brain/03_Marketing/`

### Task 3a: Marketing.md (index)

- [ ] Utwórz `cbt-toolkit-brain/03_Marketing/Marketing.md`:

```markdown
# Marketing

> Part of [[VAULT-INDEX]]

CBT Toolkit marketing focuses on the Polish mental health community — individuals in or alongside CBT therapy, and therapists recommending digital tools.

## Subfolders

| Folder | Purpose |
|--------|---------|
| [[Branding/Branding]] | App name rationale, icon, colors, tone of voice |
| [[GTM/GTM]] | Go-to-market strategy and launch plan |
| [[ASO/ASO]] | App Store and Google Play listing optimization |
| [[Content/Content]] | Content plan, post ideas bank |

## Lead Agent

`marketing-lead` — owns this entire section.

## Status

Pre-launch. Structure established. Content to be filled before v1.0.0 launch.
```

### Task 3b: Branding.md

- [ ] Utwórz `cbt-toolkit-brain/03_Marketing/Branding/Branding.md`:

```markdown
# Branding

> Part of [[Marketing]]

## App Name

**CBT Toolkit** — chosen for clarity and searchability. Polish users searching for "CBT aplikacja" or "narzędzia CBT" will find this. Not trying to be clever — trying to be found.

## Tone of Voice

- Clinical but warm — not academic, not self-help-y
- Direct — tells users exactly what each screen does
- Polish language register: standard (nie: regionalny, nie: formalny urzędowy)
- No infantilizing ("Super! 🎉") — therapy is serious work

## Visual Identity

*TBD before v1.0.0 — to be defined when app icon is finalized.*

- Primary color: TBD
- Icon concept: TBD
- Typography: system fonts (React Native default for now)

## Open Questions

- [ ] Final app icon design
- [ ] Splash screen design
- [ ] Play Store / App Store feature graphic
```

### Task 3c: GTM.md

- [ ] Utwórz `cbt-toolkit-brain/03_Marketing/GTM/GTM.md`:

```markdown
# Go-to-Market Strategy

> Part of [[Marketing]]

## Launch Gate

Release v1.0.0 only when:
- 3+ CBT tools implemented and polished
- Google Play listing live
- App Store listing live (TestFlight first)
- Full Polish UI (zero English bleed)

## Target Channels

### Primary
- **Polish Reddit** — r/psychologia, r/zdrowiepsychiczne
- **Facebook groups** — Polish CBT and therapy self-help groups
- **Wykop** — Polish HN/Reddit alternative, tech-adjacent audience

### Secondary
- **Therapist outreach** — email/forum posts to Polish CBT practitioners
- **YouTube** — demo video showing the side-by-side column view

## Positioning Message

> Pierwsze polskie, darmowe i wielonarzędziowe narzędzie do terapii poznawczo-behawioralnej. Bez konta, bez chmury, bez paywalla.

## Launch Sequence

1. Soft launch — Google Play (Android only, Polish market)
2. Collect feedback, fix critical bugs
3. App Store submission (iOS)
4. Community posts + therapist outreach
5. v1.0.1 with first batch of feedback fixes

## Open Questions

- [ ] Which tool to lead with in marketing (thought-record most universal)
- [ ] Whether to approach any Polish psychology associations
- [ ] Privacy policy URL needed for store listings
```

### Task 3d: ASO.md

- [ ] Utwórz `cbt-toolkit-brain/03_Marketing/ASO/ASO.md`:

```markdown
# App Store Optimization (ASO)

> Part of [[Marketing]]

App Store Optimization for Google Play (primary) and Apple App Store (secondary).

## Google Play

### Title (max 30 chars)
`CBT Toolkit – Terapia CBT`

### Short Description (max 80 chars)
*Draft:* `Darmowe narzędzia CBT po polsku. Dziennik myśli, eksperymenty behawioralne i więcej.`

### Full Description
*TBD — draft before v1.0.0*

Key points to include:
- Free, no paywall, no account required
- Polish-first, clinical-quality language
- Thought record with side-by-side column view
- Behavioral experiments
- Local data (no cloud, privacy by design)
- Modular — more tools coming

### Keywords (Polish ASO)
Primary: `CBT`, `terapia poznawczo-behawioralna`, `dziennik myśli`, `CBT aplikacja`
Secondary: `zdrowie psychiczne`, `terapia`, `eksperymenty behawioralne`, `zapis myśli`

## Apple App Store

*TBD — after Play Store soft launch*

## Screenshots Plan

Required screens for both stores:
1. Home screen (tool launcher)
2. Thought record — step flow
3. Thought record — side-by-side compare view
4. Behavioral experiment — detail
5. Settings

*Screenshots exist in `docs/screenshots/` in the app repo.*
```

### Task 3e: Content.md + Task 3f: Post-Ideas-Bank.md

- [ ] Utwórz `cbt-toolkit-brain/03_Marketing/Content/Content.md`:

```markdown
# Content

> Part of [[Marketing]]

## Content Plan

Content is created around launch. Goal: explain what CBT Toolkit does and why it's different — not generic mental health content.

## Files

- [[Post-Ideas-Bank]] — Raw ideas for Reddit/Facebook/Wykop posts at launch
```

- [ ] Utwórz `cbt-toolkit-brain/03_Marketing/Content/Post-Ideas-Bank.md`:

```markdown
# Post Ideas Bank

> Part of [[Content]]

Raw ideas for launch posts. Not polished copy — capture the angle, write copy closer to launch.

---

## Reddit / Wykop

**Angle: "Brak polskiej aplikacji CBT mnie wkurzał, więc sam zrobiłem"**
- Show the problem (English-only, paywalled apps)
- Show the solution (side-by-side view is the killer demo)
- Lead with screenshot of compare screen

**Angle: "Pierwsze polskie, darmowe narzędzie CBT"**
- Shorter, more direct
- Good for r/psychologia if they're wary of self-promotion

**Angle: Pytanie do terapeutów**
- "Jakie narzędzia polecacie klientom do CBT?" → organically mention the app

---

## Facebook (CBT / therapy groups)

**Angle: "Stworzyłem darmową aplikację CBT dla polskojęzycznych użytkowników"**
- More personal framing
- Link to Play Store

---

## Demo content ideas

- Screen recording: filling out a thought record start-to-finish (< 60 sec)
- Screen recording: the compare/side-by-side view (the unique differentiator)
```

- [ ] Commit: `docs: add 03_Marketing folder structure`

---

## Task 4: Templates/

**Files:** `cbt-toolkit-brain/Templates/`

### Task 4a-4d: Wszystkie templates

- [ ] Utwórz `cbt-toolkit-brain/Templates/Templates.md`:

```markdown
# Templates

> Part of [[VAULT-INDEX]]

Reusable note templates for the CBT Toolkit vault.

| Template | Use For |
|----------|---------|
| [[feature-spec]] | New CBT tool feature specs (smaller than a full SPEC.md) |
| [[decision-log]] | Quick decisions that don't warrant a full ADR |
| [[task]] | Tracking a discrete piece of work |
```

- [ ] Utwórz `cbt-toolkit-brain/Templates/feature-spec.md`:

```markdown
---
title: "{{Feature Name}}"
tags: #feature
status: proposed
priority: P0
assignee: "{{agent}}"
---

# {{Feature Name}}

## Problem

{{What user problem does this solve? Who experiences it?}}

## Solution

{{How does this feature solve it?}}

## Acceptance Criteria

- [ ] {{criterion 1}}
- [ ] {{criterion 2}}

## Technical Notes

{{Implementation details, which files to touch, dependencies, risks}}

## CBT Accuracy

{{Does this feature respect the therapeutic intent? Any clinical considerations?}}

## Related

- [[{{related spec or ADR}}]]
```

- [ ] Utwórz `cbt-toolkit-brain/Templates/decision-log.md`:

```markdown
---
title: "{{Decision Title}}"
tags: #decision
date: "{{YYYY-MM-DD}}"
status: decided
---

# {{Decision Title}}

## Context

{{Why is this decision needed? What problem does it solve?}}

## Options Considered

### Option A: {{name}}
- **Pros**:
- **Cons**:

### Option B: {{name}}
- **Pros**:
- **Cons**:

## Decision

{{What was decided and by whom}}

## Rationale

{{Why this option wins}}

## Consequences

{{What becomes easier, harder, or different as a result}}
```

- [ ] Utwórz `cbt-toolkit-brain/Templates/task.md`:

```markdown
---
title: "{{Task Title}}"
tags: #task
status: todo
assignee: "{{agent}}"
due: "{{YYYY-MM-DD}}"
priority: medium
---

# {{Task Title}}

## Description

{{What needs to be done and why}}

## Acceptance Criteria

- [ ] {{criterion 1}}
- [ ] {{criterion 2}}

## Notes

{{Additional context, relevant files, links}}
```

- [ ] Commit: `docs: add Templates folder with feature-spec, decision-log, task`

---

## Task 5: 00_Company/Vision-Mission.md

**File:** `cbt-toolkit-brain/00_Company/Vision-Mission.md`

- [ ] Utwórz `cbt-toolkit-brain/00_Company/Vision-Mission.md`:

```markdown
# Company — Vision & Mission

> Part of [[VAULT-INDEX]]

## Who We Are

CBT Toolkit is a solo-built, open-source project by a Polish developer who saw a gap in the mental health app market and decided to fill it.

Not a startup. Not a product company (yet). A practitioner-built tool made with care.

## Mission

> Dać polskojęzycznym użytkownikom dostęp do profesjonalnych narzędzi CBT — za darmo, po polsku, bez danych w chmurze.

In English: Give Polish-speaking users access to professional-quality CBT tools — free, in Polish, without cloud accounts.

## Vision

A world where the language you speak and your ability to pay don't determine your access to evidence-based mental health tools.

## Values

**Polish-first, not Polish-translated.**
Every string is written natively, not translated from English. Clinical-quality language, not awkward localization.

**Free as in always free.**
Core CBT tools are free forever. Mental health support should not depend on one's income.

**Privacy by design.**
Your therapy homework stays on your device. No accounts, no cloud, no tracking.

**Therapeutic accuracy over feature velocity.**
A CBT tool that gets the therapy wrong is worse than no tool at all. Clinical accuracy is non-negotiable.

**Quality over quantity.**
Three excellent tools beat ten mediocre ones. Ship fewer things, built right.

## Long-Term Direction

- v1.0.0: 3+ tools, Play Store + App Store
- Future: More CBT techniques (worry log, activity scheduling, cognitive restructuring)
- Possible: Therapist recommendation flow, offline export for sharing with therapist
- Not planned: AI chat, cloud sync, subscriptions for core features
```

- [ ] Commit: `docs: add 00_Company Vision-Mission`

---

## Verification

Po implementacji wszystkich tasków:

- [ ] Sprawdź że `.claude/agents/` zawiera 6 plików
- [ ] Sprawdź że `VAULT-INDEX.md` jest w root vault
- [ ] Sprawdź że `03_Marketing/` ma właściwą strukturę (5 podfolderów)
- [ ] Sprawdź że `Templates/` zawiera 4 pliki
- [ ] Sprawdź że `00_Company/Vision-Mission.md` istnieje
- [ ] Zrób `git log --oneline -10` w brain repo żeby potwierdzić commity
