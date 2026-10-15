Scaffold a new CBT tool module. Usage: /new-tool <tool-id>

Preflight (stop on any failure):
- `~/brains/cbt-toolkit-app/` must exist; otherwise ask the user to restart with `--add-dir ~/brains/cbt-toolkit-app`.
- <tool-id> must match `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` (kebab-case).
- Collision check: abort if `src/tools/<tool-id>/`, `src/app/(tools)/<tool-id>/` or `~/brains/cbt-toolkit-app/Product/Tools/<tool-id>/` already exists, or the id is already in `src/tools/registry.ts`.

Show the list of files/dirs and edits that will be made and get explicit confirmation before writing anything.

In the brain:
1. Create `~/brains/cbt-toolkit-app/Product/Tools/<tool-id>/Spec.md` from `_Template.md`
2. Add `> Part of [[Product]]` to the new Spec.md
3. Update `~/brains/cbt-toolkit-app/Product/Tools/Tools.md` with the new tool entry

In the code repo:
4. Create `src/tools/<tool-id>/` with: index.ts, types.ts, repository.ts, migrations/, screens/, components/, hooks/, i18n/pl.ts
5. Register the tool with a single added line (import + array entry) in `src/tools/registry.ts`, with `enabled: false`. This is the only allowed edit to existing files.
6. Create route group in `src/app/(tools)/<tool-id>/`

Remind the user: "Tool scaffolded but disabled. Write the full spec with /spec <tool-id>, then implement screens before enabling."
