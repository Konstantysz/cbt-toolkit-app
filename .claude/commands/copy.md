Compare the in-repo Polish UI strings with the brain's Copy.md mirror. Usage: /copy

Preflight: if `~/brains/cbt-toolkit-app/Design/Copy.md` does not exist, stop and ask the user to restart with `--add-dir ~/brains/cbt-toolkit-app`.

The canonical source is the repo: `src/core/i18n/pl.ts` and `src/tools/<tool-id>/i18n/pl.ts`. Copy.md is a mirror.

1. Read Copy.md and the repo i18n files (read-only so far).
2. List strings grouped by tool module; report strings missing from Copy.md, stale in Copy.md, and hardcoded UI text found outside i18n files.
3. Show the proposed Copy.md changes and get explicit confirmation before writing. Only Copy.md may be edited; never change repo i18n files from this command.
