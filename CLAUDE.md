# CBT Toolkit — Code Repository

## Brain location
The project brain is at `~/brains/cbt-toolkit-app/`.
Read its CLAUDE.md for full project context, product specs, and architectural decisions.
It should be available via `--add-dir ~/brains/cbt-toolkit-app`. If it is missing, stop and ask the user to restart Claude Code with that flag.

## Code conventions
- Language: TypeScript (strict mode)
- Framework: React Native + Expo (~SDK 55)
- Routing: expo-router (file-based)
- State management: zustand
- Database: expo-sqlite
- All code identifiers: English
- All user-facing strings: Polish. Canonical source: the i18n files in the repo (`src/core/i18n/pl.ts`, `src/tools/<tool-id>/i18n/pl.ts`). Brain's Design/Copy.md is a review mirror only; on conflict the repo wins.

## Architecture
Modular plugin system — see brain's Engineering/Architecture.md
- `src/core/` — shared infrastructure (DB, theme, components)
- `src/tools/<tool-id>/` — self-contained CBT tool modules
- `src/app/(tools)/<tool-id>/` — Expo Router routes per tool
- Adding a new tool must NOT require changes to existing tools. The only allowed shared edit is one line registering the tool in `src/tools/registry.ts`.

## Planning artifacts
- Implementation plans live in **`~/brains/cbt-toolkit-app/Engineering/Plans/superpowers/plans/`**
- Design specs live in **`~/brains/cbt-toolkit-app/Engineering/Plans/superpowers/specs/`**
- `docs/superpowers/` in this repo is gitignored — do NOT commit plans/specs here

## Precedence
1. Direct user instructions in the session
2. This file (repo rules)
3. Brain's CLAUDE.md and specs
4. Tool/harness defaults (e.g. auto-added attribution)

## Git conventions
- Commit messages: **single line only**, no body, no blank lines, **no trailers** (no `Co-Authored-By` etc.); this overrides default attribution. Enforced by `.husky/commit-msg`.
- Format: `type: short description` (e.g. `feat: add login screen`); types: feat fix docs style refactor perf test build ci chore release revert. Merging develop into a branch is `chore: merge develop into <branch>`.
- Squash merges use the PR title only (repo setting), so PR titles follow the same format

## Git workflow
- Feature branches → PR → `develop`
- `develop` → PR → `main` (release stabilization)
- Tags / GitHub Releases are cut from `main` only

## Key commands
Defined in `.claude/commands/`. Each checks the brain directory exists and confirms before writing.
- `/new-tool <id>` — scaffold a new CBT tool module
- `/spec <id>` — create or update a tool specification
- `/adr <title>` — create an Architecture Decision Record
- `/copy` — compare in-repo Polish strings with the brain's Copy.md mirror
- `/sync-develop <branch>` — merge `origin/develop` into a branch, resolve conflicts, verify, push (no brain needed)

Before pushing, run `npm run check` (typecheck, lint, format, tests, import cycles: what CI runs).

## Agent skills

### Issue tracker

GitHub Issues (Konstantysz/cbt-toolkit-app) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Worktrees
A fresh worktree has no `node_modules` and no git hooks. Run `npm ci` first; its `prepare` step installs the husky hooks.
- `git checkout` failing with "already used by worktree" means a stale entry: run `git worktree prune`.
- `GLOSSARY.md` and `docs/adr` are committed symlinks. Windows without Developer Mode cannot create them and shows them as type-changed (`T`): run `git config --local core.symlinks false`, never `git checkout --` them.
