## Summary

<!-- What does this PR do? One or two sentences. -->

<!-- PR title becomes the squash commit: `type: short description` -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / tech debt
- [ ] Docs / config

## Related issues

<!-- Closes #... -->

## Checks (enforced by CI)

- [ ] `npm run lint`
- [ ] `npm run format:check`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npx expo install --check` and Android export succeed (if dependencies changed)

## Project checklist

- [ ] Base branch is `develop` (only release PRs target `main`)
- [ ] DB schema change: migration added in the tool's `migrations/`, existing data preserved
- [ ] User-facing strings are Polish and live in i18n files (no hardcoded text)
- [ ] Privacy: no new data leaves the device, no PII or user content in logs/analytics/test fixtures
- [ ] Tested on Android emulator / device
- [ ] Tested on iOS simulator / device (if applicable)

## Notes for reviewer

<!-- Anything tricky, decisions made, known limitations. -->
