Create or update a tool specification. Usage: /spec <tool-id>

1. If ~/brains/cbt-toolkit-app/Product/Tools/<tool-id>/ doesn't exist, create it from _Template.md
2. Write a full spec including: CBT background, user story, step-by-step flow, data model (TypeScript interfaces), database schema (SQL), UI screens, Polish UI copy, acceptance criteria, edge cases
3. Create/update screen specs in ~/brains/cbt-toolkit-app/Design/Screens/tools/<tool-id>/
4. Update ~/brains/cbt-toolkit-app/Product/Tools/Tools.md
5. Add > Part of [[Product]] to the new Spec.md
6. Add > Part of [[Screens]] to each new screen spec file
7. Add the new spec to ~/brains/cbt-toolkit-app/Engineering/Decisions/Decisions.md if an ADR is warranted
