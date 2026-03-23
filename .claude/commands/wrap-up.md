End-of-session wrap-up. Do the following:

1. Create a handoff note in ../cbt-toolkit-brain/00_Active/Handoffs/ named YYYY-MM-DD_NNN.md
2. Include: what was done, what's in progress, what's blocked, next steps, which tool modules changed
3. Update ../cbt-toolkit-brain/00_Active/Execution-Plan.md — mark completed items, add new ones
4. Update ../cbt-toolkit-brain/00_Active/Current-Focus.md with next session's starting point

5. Check each file below and update it IF the session changed something relevant to it.
   Do not update files where nothing changed — no cosmetic edits.

   DATABASE / DATA MODEL
   - [ ] ../cbt-toolkit-brain/02_Engineering/Data-Model.md — if any migration was added, a table changed, or a TypeScript type changed (ThoughtRecord, Emotion, etc.)

   Architecture / Plugin-API
   - [ ] ../cbt-toolkit-brain/02_Engineering/Architecture.md — if directory structure, module boundaries, or core infrastructure changed
   - [ ] ../cbt-toolkit-brain/02_Engineering/Plugin-API.md — if ToolDefinition interface, migration API, or scaffolding steps changed

   TOOL SPECS
   - [ ] ../cbt-toolkit-brain/01_Product/Tools/<tool-id>/Spec.md — if acceptance criteria, screen flow, or data model for a tool changed

   DESIGN
   - [ ] ../cbt-toolkit-brain/03_Design/Copy.md — if new Polish strings were added to any i18n/pl.ts file
   - [ ] ../cbt-toolkit-brain/03_Design/Screens/tools/<tool-id>/ — if screen layout or component spec changed

6. Commit vault changes: cd ../cbt-toolkit-brain && git add -A && git commit -m "docs: session wrap-up YYYY-MM-DD"
7. Commit code changes if any: cd ../cbt-toolkit-app && git add -A && git commit -m "<appropriate message>"

NOTE: Before updating Current-Focus.md and Execution-Plan.md, check whether you are in a worktree
(git worktree list). If yes — update freely, the branch is isolated. If no (working directly on main)
— ask the developer: "Czy mogę bezpiecznie zaktualizować Current-Focus.md i Execution-Plan.md?
(inny agent może pracować równolegle na main)"
