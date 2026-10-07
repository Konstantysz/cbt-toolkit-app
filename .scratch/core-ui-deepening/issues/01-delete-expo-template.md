# 01 — Delete unused Expo template `components/` + `constants/`

**Strength:** Strong
**Blocked by:** none

## What to build

Delete the dead template files (no replacement module — the live theme is `src/core/theme`, read via `useColors`):
- `components/EditScreenInfo.tsx`, `components/ExternalLink.tsx`, `components/StyledText.tsx`, `components/Themed.tsx`, `components/useClientOnlyValue.ts`, `components/useClientOnlyValue.web.ts`, `components/useColorScheme.ts`, `components/useColorScheme.web.ts`
- `constants/Colors.ts`
- `eslint.config.js`: drop the `'components/'` ignore entry.

Call sites to repoint: none (0 importers).

Optional, separate decision: `expo-web-browser` (`package.json:42`, `app.json:49` plugin) loses its only importer (`ExternalLink.tsx`).

## Acceptance criteria

- [ ] `components/` and `constants/` no longer exist.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm test` pass unchanged.
- [ ] App boots (no runtime import of the removed files).

## Oracle

```
rg -n "components/(Themed|EditScreenInfo|ExternalLink|StyledText|useClientOnlyValue|useColorScheme)|constants/Colors|@/components|@/constants" --glob '!node_modules' .
# @ base: only components/Themed.tsx:9 and components/EditScreenInfo.tsx:8 (template files importing each other)
rg -n "SpaceMono" --glob '!node_modules' .    # only components/StyledText.tsx:4
```
Independent verifier also checked relative imports, `jest.config.js`, `__mocks__/`, `__tests__/`, `app.json`, `tsconfig.json`: zero external importers.

**Deletion-test verdict: pure dead code.** Deleting it makes complexity vanish with nothing reappearing anywhere; it also removes a second, conflicting theming system (`Themed.useThemeColor` reads the OS scheme + its own `Colors` table).
