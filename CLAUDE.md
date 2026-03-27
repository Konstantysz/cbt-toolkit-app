# CBT Toolkit — Code Repository

## Vault location
The Obsidian brain vault is at `../cbt-toolkit-brain/`.
Read its CLAUDE.md for full project context, product specs, and architectural decisions.
This should be available via --add-dir. If not, ask the user to restart with:
  cbt-dev

## Code conventions
- Language: TypeScript (strict mode)
- Framework: React Native + Expo (~SDK 55)
- Routing: expo-router (file-based)
- State management: zustand
- Database: expo-sqlite
- All code identifiers: English
- All user-facing strings: Polish (source of truth: vault's 03_Design/Copy.md)

## Architecture
Modular plugin system — see vault's 02_Engineering/Architecture.md
- `src/core/` — shared infrastructure (DB, theme, components)
- `src/tools/<tool-id>/` — self-contained CBT tool modules
- `src/app/(tools)/<tool-id>/` — Expo Router routes per tool
- Adding a new tool must NOT require changes to existing tools

## Planning artifacts
- Implementation plans live in **`../cbt-toolkit-brain/02_Engineering/Plans/superpowers/plans/`**
- Design specs live in **`../cbt-toolkit-brain/02_Engineering/Plans/superpowers/specs/`**
- `docs/superpowers/` in this repo is gitignored — do NOT commit plans/specs here

## Git conventions
- Commit messages: **single line only**, no body, no blank lines
- Format: `type: short description` (e.g. `feat: add login screen`)

## Key commands
- `/resume` — load session context from vault
- `/wrap-up` — save session state to vault
- `/new-tool <id>` — scaffold a new CBT tool module
