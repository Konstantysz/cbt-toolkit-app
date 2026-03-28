Scaffold a new CBT tool module. Usage: /new-tool <tool-id>

In the brain:
1. Create ~/brains/cbt-toolkit-app/Product/Tools/<tool-id>/Spec.md from _Template.md
2. Add > Part of [[Product]] to the new Spec.md
3. Update ~/brains/cbt-toolkit-app/Product/Tools/Tools.md with the new tool entry

In the code repo:
4. Create src/tools/<tool-id>/ with: index.ts, types.ts, repository.ts, migrations/, screens/, components/, hooks/, i18n/pl.ts
5. Register the tool in src/tools/registry.ts
6. Create route group in src/app/(tools)/<tool-id>/

Remind the user: "Tool scaffolded but disabled. Write the full spec with /spec <tool-id>, then implement screens before enabling."
