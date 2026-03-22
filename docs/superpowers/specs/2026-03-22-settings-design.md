# Settings Screen — Design Spec

**Date:** 2026-03-22
**Status:** Approved
**Mockup:** `docs/mockups/settings-mockup.html`

---

## Overview

A fully functional Settings screen replacing the current placeholder (`src/app/settings.tsx`). Five sections: Powiadomienia, Dostępność, Dane, Zasoby pomocowe, O aplikacji. Settings persist via Zustand + AsyncStorage. Accessibility settings apply app-wide. Notifications use `expo-notifications` with full scheduling.

---

## Architecture

### Settings Store (`src/core/settings/`)

Zustand store with AsyncStorage persistence via `zustand/middleware` (`persist`). AsyncStorage is already installed (`@react-native-async-storage/async-storage`).

```ts
interface SettingsState {
  reminderEnabled: boolean;       // default: false
  reminderTime: string;           // default: "20:00" (HH:MM)
  fontSize: 'sm' | 'md' | 'lg';  // default: 'md'
  reducedMotion: boolean;         // default: false
  highContrast: boolean;          // default: false
}
```

- File: `src/core/settings/store.ts`
- AsyncStorage key: `cbt-toolkit-settings`
- Hook: `useSettings()` — returns state + actions

### Font Scale

`src/core/settings/fontScale.ts` exports a `scaledFont(base: number): number` function:
- `'sm'` → `base * 0.875`
- `'md'` → `base * 1.0`
- `'lg'` → `base * 1.2`

Used in `StyleSheet` calls where font size matters. Existing screens need not be rewritten — adoption is gradual; the Settings screen itself must use `scaledFont()` on launch.

### High Contrast Colors

`src/core/theme/index.ts` gains a `highContrastColors` export — identical shape (`typeof colors`) to `colors`, but with elevated contrast values: brighter `text` (`#FFFFFF`), stronger `border` (`#5C5650`), `accent` stays, dim variants replaced with their full counterparts. No keys are removed so TypeScript compatibility is guaranteed.

`src/core/theme/useColors.ts` exports `useColors()`:
```ts
export function useColors() {
  const { highContrast } = useSettings();
  return highContrast ? highContrastColors : colors;
}
```

**Migration scope for this feature:** Only `settings/index.tsx`, `settings/credits.tsx`, `settings/bibliography.tsx` are required to use `useColors()` at launch. Existing screens migrate opportunistically — not as part of this task.

### Reduced Motion

`useSettings().reducedMotion` flag. Only the Settings screen itself needs to honour it at launch (no animations there anyway). Gradual adoption elsewhere.

---

## Notifications

**New package:** `expo-notifications` — install via `npx expo install expo-notifications`

**Already installed:** `@react-native-community/datetimepicker` (v8.6.0)

### Behavior

- **Toggle ON:** call `requestPermissions()` → if denied, show alert with `Linking.openSettings()` CTA, toggle stays off → if granted, call `scheduleReminder(time)`
- **Toggle OFF:** call `cancelReminder()`
- **Time change:** if `reminderEnabled`, call `cancelReminder()` then `scheduleReminder(newTime)`; if not enabled, only update store
- **App launch sync** (runs in `src/app/_layout.tsx` `useEffect` on mount, once): if store says `reminderEnabled` but no scheduled notification exists (`getAllScheduledNotificationsAsync` returns empty), call `scheduleReminder(reminderTime)`. Handles cases where the OS clears scheduled notifications (e.g. after an OS update or permission reset) without clearing AsyncStorage.

### iOS permission denial UX

On iOS, once the user denies permissions, `requestPermissionsAsync` returns `denied` without showing the dialog again. The permission-denied alert must include a button that calls `Linking.openSettings()` so the user can enable permissions manually in system settings.

### Implementation files

- `src/core/notifications/schedule.ts` — `scheduleReminder(time: string): Promise<void>`, `cancelReminder(): Promise<void>`
- `src/core/notifications/permissions.ts` — `requestPermissions(): Promise<boolean>` (returns `true` if granted)
- Notification content: title `"Czas na refleksję"`, body `"Zapisz swoje myśli i emocje"`, trigger: daily at HH:MM

### Time Picker

`@react-native-community/datetimepicker` (already installed), `mode="time"`. Tapping the time row opens the native picker. On Android it appears as a dialog; on iOS as an inline spinner in a modal.

---

## Screens & Routes

Convert `src/app/settings.tsx` → folder layout:

```
src/app/settings/
  _layout.tsx          — Stack navigator, headerShown: false
  index.tsx            — main settings list
  credits.tsx          — Twórcy i podziękowania (static)
  bibliography.tsx     — Źródła i bibliografia (static)
```

Tab bar entry in `src/app/_layout.tsx`: `name="settings"` stays unchanged — Expo Router resolves the folder automatically.

**Historia zmian:** opens `Linking.openURL` to the GitHub releases page. No `changelog.tsx` route is created. The `settings.about.changelogSub` copy key is still used as a subtitle on the row.

---

## Section: Powiadomienia

| Row | Control | Behavior |
|-----|---------|----------|
| Codzienny reminder | Toggle | Requests permissions → schedules / cancels notification |
| Godzina przypomnienia | Value + chevron | **Hidden** (not rendered) when `reminderEnabled` is false; opens time picker when tapped |

---

## Section: Dostępność

| Row | Control | Behavior |
|-----|---------|----------|
| Rozmiar tekstu | 3-option selector (A / A / A) | Saves `fontSize` to store; `scaledFont()` used in Settings screens |
| Zmniejsz animacje | Toggle | Saves `reducedMotion` to store |
| Wysoki kontrast | Toggle | Saves `highContrast`; Settings screens use `useColors()` |

---

## Section: Dane

| Row | Behavior |
|-----|----------|
| Eksportuj dane | Read all records from SQLite → serialise to JSON → write temp file via `expo-file-system` → share via `expo-sharing` |
| Importuj dane | `expo-document-picker` (`.json`) → validate schema → insert into SQLite |
| Usuń wszystkie dane | `Alert.alert` confirmation → delete via tool repositories → show success toast |

### Export JSON shape

```json
{
  "version": 1,
  "exportedAt": "2026-03-22T20:00:00.000Z",
  "thoughtRecords": [...],
  "behavioralExperiments": [...]
}
```

Temp file written to `FileSystem.cacheDirectory + 'cbt-export-<timestamp>.json'`.

### Import validation rules

A file is accepted only if it passes all checks:

1. Valid JSON (parse without throwing)
2. Top-level `version` field is `1` (number)
3. `thoughtRecords` is an array (may be empty)
4. `behavioralExperiments` is an array (may be empty)
5. Each thought record has at minimum: `id` (string), `situation` (string), `createdAt` (string)
6. Each behavioral experiment has at minimum: `id` (string), `belief` (string), `createdAt` (string)
7. Total record count ≤ 5000 (guard against malformed files)

**Conflict resolution:** if an `id` already exists in SQLite, skip (do not overwrite). `isExample` records in the import file are imported as-is.

On validation failure: show an `Alert` with a human-readable error describing which check failed.

### Delete all data

Call each tool's repository `deleteAll()` method (existing or to be added). Do **not** hardcode table names in Settings — repositories own their tables, preserving the plugin architecture. The `migrations_log` table is not touched.

Both `ThoughtRecordRepository` and `BehavioralExperimentRepository` need a `deleteAll(db): Promise<void>` method added.

---

## Section: Zasoby pomocowe

Static list, no persistence. Each row calls `Linking.openURL`.

| Label | Action |
|-------|--------|
| Telefon Zaufania dla Dorosłych — 116 123 | `tel:116123` |
| Telefon Zaufania dla Dzieci — 116 111 | `tel:116111` |
| Centrum Wsparcia — centrumwsparcia.pl | `https://centrumwsparcia.pl` |

---

## Section: O aplikacji

| Row | Behavior |
|-----|----------|
| App identity block | Name: `pl.app.title` → `"Zestaw Narzędzi TPB"`. Version: `Constants.expoConfig?.version` from `expo-constants` |
| Twórcy i podziękowania | Navigate → `settings/credits` |
| Źródła i bibliografia | Navigate → `settings/bibliography` |
| Historia zmian | `Linking.openURL` → GitHub releases page |
| Zgłoś problem | `Linking.openURL` → GitHub Issues |

### Credits screen (`settings/credits.tsx`)

Static content: author name(s), acknowledgements, open-source packages used (React Native, Expo, Zustand, expo-sqlite).

### Bibliography screen (`settings/bibliography.tsx`)

Static content: key CBT references — Beck (1979), Burns (1980), and 2–3 additional Polish/English sources relevant to thought records and behavioral experiments.

---

## i18n / Polish copy (new keys)

| Key | Polish |
|-----|--------|
| `settings.notifications.title` | Powiadomienia |
| `settings.notifications.reminder` | Codzienny reminder |
| `settings.notifications.reminderSub` | Przypomnienie o codziennej refleksji |
| `settings.notifications.time` | Godzina przypomnienia |
| `settings.notifications.permissionDenied` | Brak uprawnień do powiadomień. |
| `settings.notifications.permissionDeniedBtn` | Otwórz ustawienia |
| `settings.accessibility.title` | Dostępność |
| `settings.accessibility.fontSize` | Rozmiar tekstu |
| `settings.accessibility.reducedMotion` | Zmniejsz animacje |
| `settings.accessibility.reducedMotionSub` | Redukuje ruch na ekranie |
| `settings.accessibility.highContrast` | Wysoki kontrast |
| `settings.accessibility.highContrastSub` | Mocniejsze kolory i obramowania |
| `settings.data.title` | Dane |
| `settings.data.export` | Eksportuj dane |
| `settings.data.exportSub` | Zapisz wszystkie wpisy jako JSON |
| `settings.data.import` | Importuj dane |
| `settings.data.importSub` | Wczytaj wcześniej zapisany plik |
| `settings.data.deleteAll` | Usuń wszystkie dane |
| `settings.data.deleteAllSub` | Nieodwracalne — usuwa wszystkie wpisy |
| `settings.data.deleteConfirmTitle` | Usuń wszystkie dane? |
| `settings.data.deleteConfirmMsg` | Ta operacja jest nieodwracalna. Wszystkie twoje wpisy zostaną usunięte. |
| `settings.data.importError` | Nieprawidłowy plik. Sprawdź format i spróbuj ponownie. |
| `settings.resources.title` | Zasoby pomocowe |
| `settings.resources.adults` | Telefon Zaufania dla Dorosłych |
| `settings.resources.children` | Telefon Zaufania dla Dzieci |
| `settings.resources.centrum` | Centrum Wsparcia |
| `settings.about.title` | O aplikacji |
| `settings.about.credits` | Twórcy i podziękowania |
| `settings.about.bibliography` | Źródła i bibliografia |
| `settings.about.changelog` | Historia zmian |
| `settings.about.changelogSub` | Co nowego w tej wersji |
| `settings.about.report` | Zgłoś problem |

---

## Dependencies

### New (install via `npx expo install`)

| Package | Purpose |
|---------|---------|
| `expo-notifications` | Local notification scheduling |
| `expo-sharing` | Share exported JSON file |
| `expo-document-picker` | Pick JSON file for import |
| `expo-file-system` | Write temp JSON file before sharing |

### Already installed

| Package | Note |
|---------|------|
| `@react-native-community/datetimepicker` | v8.6.0, used for time picker |
| `@react-native-async-storage/async-storage` | Used by Zustand persist middleware |

---

## Testing

- `useSettings` store: default values, persist/rehydrate, all setters
- `scaledFont()`: correct multipliers for all three options
- `permissions.ts`: mocked `expo-notifications`, granted / denied flows
- `schedule.ts`: mocked `expo-notifications`, verifies schedule/cancel called with correct trigger
- `exportData()`: serialises both tables correctly, correct JSON shape
- `importData()`: accepts valid file, rejects each invalid case (version mismatch, missing fields, over limit, invalid JSON), skips duplicates
- `ThoughtRecordRepository.deleteAll()` / `BehavioralExperimentRepository.deleteAll()`: verifies DELETE executed
- Settings screen: renders all 5 sections, toggle reminder on/off hides/shows time row, font size selector updates active option
- Credits / Bibliography screens: render without crash

---

## Out of scope

- PIN / biometric lock — Phase 4
- Light theme — Phase 4
- Language selection — Polish only
- Cloud backup / sync — not planned
- Applying `reducedMotion` / `highContrast` to existing screens — gradual, not part of this task
