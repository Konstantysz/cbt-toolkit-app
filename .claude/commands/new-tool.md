Scaffold a new CBT tool module. Usage: /new-tool <tool-id>

In the vault:
1. Create ../cbt-toolkit-brain/01_Product/Tools/<tool-id>/Spec.md from _Template.md
2. Update ../cbt-toolkit-brain/01_Product/Tools/tools.md

In the code repo:
3. Create src/tools/<tool-id>/ with: index.ts, types.ts, repository.ts, migrations/, screens/, components/, hooks/, i18n/pl.ts
4. Register the tool in src/tools/registry.ts
5. Create route group in src/app/(tools)/<tool-id>/

Remind the user: "Tool scaffolded but disabled. Write the full spec with /spec <tool-id>, then implement screens before enabling."
