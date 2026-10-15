Merge the latest `origin/develop` into a feature branch, resolve conflicts, verify, push. Usage: /sync-develop <branch>

Run it right after any merge into `develop`, while open branches are still small diffs.

1. `git fetch`, then `git worktree prune` (stale `.claude/worktrees/*` entries make checkout fail with "already used by worktree").
2. `git checkout <branch>` as its own call, then `git branch --show-current` and confirm it prints `<branch>`. Never pipe or chain checkout into the merge: a swallowed failure merges into the wrong branch.
3. `git merge origin/develop --no-commit`, then list conflicts with `git diff --name-only --diff-filter=U`.
4. Resolve with the `resolving-merge-conflicts` skill and the Edit tool. Develop's logic wins; its new user-facing strings move into the i18n files (`src/core/i18n/pl.ts`, `src/tools/<tool-id>/i18n/pl.ts`) so `noHardcodedStrings.test.ts` stays green.
5. `npm ci`, then `npm run check`. Done when every command in it exits 0 and no `<<<<<<<` markers remain in `src`.
6. Commit `chore: merge develop into <branch>` (single line, no trailers; husky rejects other shapes), then `git push` without `--force`.
7. Report the PR's CI state with `gh pr checks`; say "pending" if it has not finished.
