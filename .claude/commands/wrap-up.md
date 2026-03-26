End-of-session wrap-up. Follow EVERY step in order. Do not skip steps.

---

## STEP 0 — Gather evidence (required before anything else)

Run these commands and keep the output in mind for all decisions below:

```bash
cd /f/cbt-toolkit/cbt-toolkit-app && git diff HEAD --name-only
cd /f/cbt-toolkit/cbt-toolkit-app && git status --short
cd /f/cbt-toolkit/cbt-toolkit-brain && git diff HEAD --name-only
cd /f/cbt-toolkit/cbt-toolkit-brain && git status --short
```

Also note which tool modules were touched (look for paths like `src/tools/<tool-id>/`).
List them explicitly: **Changed tool modules: [list here]**

---

## STEP 1 — Create handoff note

File: `../cbt-toolkit-brain/00_Active/Handoffs/YYYY-MM-DD_NNN.md`

To determine NNN: list existing handoffs with `ls ../cbt-toolkit-brain/00_Active/Handoffs/` and use the next number.

Include sections:
- **What was done** (concrete, per-PR or per-feature)
- **In progress / open** (branch names, PR numbers)
- **Blocked** (list or "None")
- **Next steps** (numbered, actionable)
- **Tool modules changed** (file paths)

---

## STEP 2 — Update Execution-Plan.md

File: `../cbt-toolkit-brain/00_Active/Execution-Plan.md`

- Mark completed items `[x]` with session number and date
- Add new items that emerged this session

---

## STEP 3 — Update Current-Focus.md

File: `../cbt-toolkit-brain/00_Active/Current-Focus.md`

**Before editing**, check: `git worktree list`
- If in a worktree → update freely
- If on main → ask: "Czy mogę bezpiecznie zaktualizować Current-Focus.md i Execution-Plan.md? (inny agent może pracować równolegle na main)"

Content: next session's concrete starting point (goal, first 3 commands to run, repo state summary).

---

## STEP 4 — Conditional vault updates

For EACH file below:
1. Check the evidence from STEP 0
2. Decide: does the session warrant an update?
3. Record your decision as ✅ updated / ⏭ skipped (reason) — include this in the handoff note

### 4a. Data model
`../cbt-toolkit-brain/02_Engineering/Data-Model.md`
Update if: a migration file was added/changed, a DB table schema changed, or a TypeScript type (ThoughtRecord, BehavioralExperiment, AbcEntry, etc.) changed.

### 4b. Architecture
`../cbt-toolkit-brain/02_Engineering/Architecture.md`
Update if: directory structure changed (new folders in `src/`), new shared component added to `core/`, or module boundaries changed.

### 4c. Plugin API
`../cbt-toolkit-brain/02_Engineering/Plugin-API.md`
Update if: `ToolDefinition` interface changed, migration registration API changed, or scaffolding steps changed.

### 4d. Tool Spec(s)
**Resolve `<tool-id>`** from the list in STEP 0 (e.g. `thought-record`, `behavioral-experiment`).
Do this for EACH changed tool module separately.

**Case A — existing tool was modified:**
File: `../cbt-toolkit-brain/01_Product/Tools/<tool-id>/Spec.md`
Update if ANY of:
- Screen flow changed (steps added/removed/reordered)
- New screen added or removed
- Acceptance criteria changed
- Data model for the tool changed
- New feature/functionality added within the tool (e.g. new export, new mode, new action)

**Case B — new tool was scaffolded this session:**
Check: does `../cbt-toolkit-brain/01_Product/Tools/<tool-id>/Spec.md` exist?
- If NO → CREATE it using `../cbt-toolkit-brain/01_Product/Tools/_Template.md` as base. Fill in all sections from the implementation.
- If YES → treat as Case A.

### 4e. Polish copy
`../cbt-toolkit-brain/03_Design/Copy.md`
Update if: any `src/tools/<tool-id>/i18n/pl.ts` file was modified or created. Diff the i18n files against Copy.md and add ALL missing keys.

### 4f. Screen specs
**Resolve `<tool-id>`** from the list in STEP 0.
Do this for EACH changed tool module separately.

**Case A — existing tool, existing screens modified:**
File: `../cbt-toolkit-brain/03_Design/Screens/tools/<tool-id>/<ScreenName>.md`
Update if: a screen's layout, component list, props, or UX flow changed.

**Case B — new screen added to existing or new tool:**
Check: does `../cbt-toolkit-brain/03_Design/Screens/tools/<tool-id>/` exist?
- If NO → CREATE the directory and a `.md` file per screen implemented.
- If YES → CREATE a new `.md` file for each new screen, update existing ones if changed.

Each screen spec should document: purpose, route path, key components, user actions, navigation flow.

---

## STEP 5 — Verification checklist

Before committing, confirm aloud:
- [ ] Handoff file created with correct NNN number
- [ ] Execution-Plan.md has all completed items marked
- [ ] Current-Focus.md reflects next session's actual starting point
- [ ] Each conditional file either updated OR explicitly skipped with reason
- [ ] No placeholder `<tool-id>` left unresolved in any file

---

## STEP 6 — Commit vault

```bash
cd /f/cbt-toolkit/cbt-toolkit-brain && git add -A && git commit -m "docs: session wrap-up YYYY-MM-DD"
```

---

## STEP 7 — Commit code changes (if any uncommitted)

```bash
cd /f/cbt-toolkit/cbt-toolkit-app && git add -A && git commit -m "<appropriate type: message>"
```

Only run if `git status` shows uncommitted changes. Do not commit if working tree is clean.
