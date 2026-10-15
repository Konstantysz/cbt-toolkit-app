Create or update a tool specification. Usage: /spec <tool-id>

Preflight (stop on any failure):
- `~/brains/cbt-toolkit-app/` must exist; otherwise ask the user to restart with `--add-dir ~/brains/cbt-toolkit-app`.
- <tool-id> must match `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`. If it is not a known tool (`src/tools/<tool-id>/` or an existing brain spec), ask whether to proceed.

Show which brain files will be created or changed (new vs. update) and get explicit confirmation before writing. When updating an existing Spec.md, show the diff first and do not discard existing content.

1. If `~/brains/cbt-toolkit-app/Product/Tools/<tool-id>/` doesn't exist, create it from `_Template.md`
2. Write a full spec including: CBT background, user story, step-by-step flow, data model (TypeScript interfaces), database schema (SQL), UI screens, Polish UI copy, acceptance criteria, edge cases
3. Create/update screen specs in `~/brains/cbt-toolkit-app/Design/Screens/tools/<tool-id>/`
4. Update `~/brains/cbt-toolkit-app/Product/Tools/Tools.md`
5. Add `> Part of [[Product]]` to the new Spec.md
6. Add `> Part of [[Screens]]` to each new screen spec file
7. Suggest an ADR via `/adr` if one is warranted (do not write it from here)
