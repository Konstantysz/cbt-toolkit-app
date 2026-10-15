Create an Architecture Decision Record. Usage: /adr <title>

Preflight:
- If `~/brains/cbt-toolkit-app/Engineering/Decisions/` does not exist, stop and ask the user to restart with `--add-dir ~/brains/cbt-toolkit-app`.
- If <title> is empty, ask for it.
- Context, Decision, Consequences and Alternatives must come from the user or the current session. If any is unknown, ask. Never invent rationale.

Steps:
1. Find the highest existing ADR-NNN in the directory and use NNN+1 (zero-padded). Name the file `ADR-NNN-<title>.md` (PascalCase-hyphen, no overwrite of an existing file).
2. Show the draft and target paths, and get explicit confirmation before writing anything.
3. Write the file, then add it to `~/brains/cbt-toolkit-app/Engineering/Decisions/Decisions.md` under Key Files.

Content is English. Format:

```
# ADR-NNN: <Title>

> Part of [[Decisions]]

## Status: Accepted
## Date: YYYY-MM-DD
## Context: [What prompted this decision?]
## Decision: [What did we decide?]
## Consequences: [What are the implications?]
## Alternatives Considered: [What else and why rejected?]
```
