# CBT Toolkit — Code Repository

## Vault location
The Obsidian brain vault is at `../cbt-toolkit-brain/`.
Read its CLAUDE.md for full project context, product specs, and architectural decisions.
This should be available via --add-dir. If not, ask the user to restart with:
  cbt-dev

## Code conventions
- Language: TypeScript (strict mode)
- Framework: React Native + Expo (~SDK 52)
- Routing: expo-router (file-based)
- State management: zustand
- Database: expo-sqlite
- All code identifiers: English
- All user-facing strings: Polish (source of truth: vault's 03_Design/COPY.md)

## Architecture
Modular plugin system — see vault's 02_Engineering/ARCHITECTURE.md
- `src/core/` — shared infrastructure (DB, theme, components)
- `src/tools/<tool-id>/` — self-contained CBT tool modules
- `src/app/(tools)/<tool-id>/` — Expo Router routes per tool
- Adding a new tool must NOT require changes to existing tools

## Key commands
- `/resume` — load session context from vault
- `/wrap-up` — save session state to vault
- `/new-tool <id>` — scaffold a new CBT tool module
