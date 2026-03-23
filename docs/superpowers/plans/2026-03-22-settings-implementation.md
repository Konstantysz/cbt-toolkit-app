# Settings Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a fully functional Settings screen (replacing the placeholder `settings.tsx`) with daily reminder notifications, accessibility options (font size, reduced motion, high contrast), data export/import/delete, static resource links, and static info screens.

**Architecture:** Zustand v5 + AsyncStorage `persist` middleware for settings storage; `expo-notifications` for daily reminders; `expo-file-system` + `expo-sharing` + `expo-document-picker` for data operations; settings screen converts from a single `settings.tsx` file to an Expo Router `settings/` folder layout with sub-routes for Credits and Bibliography.

**Tech Stack:** Zustand v5, @react-native-async-storage/async-storage, expo-notifications, expo-file-system, expo-sharing, expo-document-picker, @react-native-community/datetimepicker (already installed), expo-constants, expo-linking

---

## File Map

**Create:**
- `src/core/settings/store.ts` — Zustand persist store, `useSettings()` hook, `FontSize` type
- `src/core/settings/fontScale.ts` — `scaledFont(base, size)` utility *(Note: spec defines single-arg `scaledFont(base)` reading from store; plan uses two-arg pure function for testability — better design, same result at call sites)*
- `src/core/settings/__tests__/store.test.ts`
- `src/core/settings/__tests__/fontScale.test.ts`
- `src/core/theme/useColors.ts` — `useColors()` hook
- `src/core/theme/__tests__/useColors.test.ts`
- `src/core/notifications/permissions.ts` — `requestPermissions()`
- `src/core/notifications/schedule.ts` — `scheduleReminder()`, `cancelReminder()`
- `src/core/notifications/__tests__/permissions.test.ts`
- `src/core/notifications/__tests__/schedule.test.ts`
- `src/core/data/export.ts` — `exportData(db)`
- `src/core/data/import.ts` — `importData(db, uri)`, `validateExportFile(data)`
- `src/core/data/__tests__/export.test.ts`
- `src/core/data/__tests__/import.test.ts`
- `src/tools/thought-record/__tests__/repository.test.ts` — new file (deleteAll test only)
- `src/app/settings/_layout.tsx` — Stack navigator for settings sub-routes
- `src/app/settings/__tests__/index.test.tsx` — screen render tests
- `src/app/settings/index.tsx` — main settings screen (all 5 sections)
- `src/app/settings/credits.tsx` — static credits screen
- `src/app/settings/bibliography.tsx` — static bibliography screen

**Modify:**
- `src/core/theme/index.ts` — add `highContrastColors` export
- `src/core/i18n/pl.ts` — add `settings` namespace with all keys
- `src/tools/thought-record/repository.ts` — add `deleteAll(db)`
- `src/tools/behavioral-experiment/repository.ts` — add `deleteAll(db)`
- `src/tools/behavioral-experiment/__tests__/repository.test.ts` — add deleteAll describe block
- `src/app/_layout.tsx` — add notification launch-sync useEffect

**Delete:**
- `src/app/settings.tsx` — replaced by `src/app/settings/` folder

---

### Task 0: Install packages + verify baseline

**Files:** (package installation only — no source files)

- [ ] **Step 1: Install new packages**

Run in worktree root (`F:/cbt-toolkit/cbt-toolkit-app/.worktrees/feat/phase4-settings`):
```bash
npx expo install expo-notifications expo-sharing expo-document-picker expo-file-system
```
Expected: packages installed, `package.json` updated with new entries.

- [ ] **Step 2: Verify baseline tests still pass**

Run: `npx jest --passWithNoTests`
Expected: `52 passed, 0 failed`

- [ ] **Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: install expo-notifications, sharing, document-picker, file-system"
```

---

### Task 1: i18n — add settings strings

**Files:**
- Modify: `src/core/i18n/pl.ts`

- [ ] **Step 1: Replace content of `src/core/i18n/pl.ts`**

The file currently exports a small `pl` object. Replace the entire file:

```ts
export const pl = {
  app: { title: 'Zestaw Narzędzi TPB' },
  nav: { home: 'Narzędzia', settings: 'Ustawienia' },
  common: {
    newEntry: 'Nowy wpis',
    history: 'Historia',
    save: 'Zapisz',
    cancel: 'Anuluj',
    delete: 'Usuń',
    edit: 'Edytuj',
    next: 'Dalej',
    back: 'Wstecz',
    done: 'Gotowe',
    search: 'Szukaj',
    noEntries: 'Brak wpisów',
    confirmDelete: 'Czy na pewno chcesz usunąć?',
  },
  settings: {
    notifications: {
      title: 'Powiadomienia',
      reminder: 'Codzienny reminder',
      reminderSub: 'Przypomnienie o codziennej refleksji',
      time: 'Godzina przypomnienia',
      permissionDenied: 'Brak uprawnień do powiadomień.',
      permissionDeniedBtn: 'Otwórz ustawienia',
    },
    accessibility: {
      title: 'Dostępność',
      fontSize: 'Rozmiar tekstu',
      reducedMotion: 'Zmniejsz animacje',
      reducedMotionSub: 'Redukuje ruch na ekranie',
      highContrast: 'Wysoki kontrast',
      highContrastSub: 'Mocniejsze kolory i obramowania',
    },
    data: {
      title: 'Dane',
      export: 'Eksportuj dane',
      exportSub: 'Zapisz wszystkie wpisy jako JSON',
      import: 'Importuj dane',
      importSub: 'Wczytaj wcześniej zapisany plik',
      deleteAll: 'Usuń wszystkie dane',
      deleteAllSub: 'Nieodwracalne — usuwa wszystkie wpisy',
      deleteConfirmTitle: 'Usuń wszystkie dane?',
      deleteConfirmMsg: 'Ta operacja jest nieodwracalna. Wszystkie twoje wpisy zostaną usunięte.',
      importError: 'Nieprawidłowy plik. Sprawdź format i spróbuj ponownie.',
    },
    resources: {
      title: 'Zasoby pomocowe',
      adults: 'Telefon Zaufania dla Dorosłych',
      children: 'Telefon Zaufania dla Dzieci',
      centrum: 'Centrum Wsparcia',
    },
    about: {
      title: 'O aplikacji',
      credits: 'Twórcy i podziękowania',
      bibliography: 'Źródła i bibliografia',
      changelog: 'Historia zmian',
      changelogSub: 'Co nowego w tej wersji',
      report: 'Zgłoś problem',
    },
  },
} as const;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Run tests to catch any regressions**

Run: `npx jest`
Expected: 52 passed (i18n is data — no new tests, but we verify nothing broke)

- [ ] **Step 4: Commit**
```bash
git add src/core/i18n/pl.ts
git commit -m "feat: add settings i18n strings"
```

---

### Task 2: Settings store (TDD)

**Files:**
- Create: `src/core/settings/__tests__/store.test.ts`
- Create: `src/core/settings/store.ts`

- [ ] **Step 1: Write failing tests**

Create `src/core/settings/__tests__/store.test.ts`:

```ts
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

import { useSettings } from '../store';

const DEFAULTS = {
  reminderEnabled: false,
  reminderTime: '20:00',
  fontSize: 'md' as const,
  reducedMotion: false,
  highContrast: false,
};

beforeEach(() => {
  useSettings.setState(DEFAULTS, true);
});

describe('useSettings — defaults', () => {
  it('has correct default values', () => {
    const s = useSettings.getState();
    expect(s.reminderEnabled).toBe(false);
    expect(s.reminderTime).toBe('20:00');
    expect(s.fontSize).toBe('md');
    expect(s.reducedMotion).toBe(false);
    expect(s.highContrast).toBe(false);
  });
});

describe('useSettings — setters', () => {
  it('setReminderEnabled updates reminderEnabled', () => {
    useSettings.getState().setReminderEnabled(true);
    expect(useSettings.getState().reminderEnabled).toBe(true);
  });

  it('setReminderTime updates reminderTime', () => {
    useSettings.getState().setReminderTime('08:30');
    expect(useSettings.getState().reminderTime).toBe('08:30');
  });

  it('setFontSize updates fontSize', () => {
    useSettings.getState().setFontSize('lg');
    expect(useSettings.getState().fontSize).toBe('lg');
  });

  it('setReducedMotion updates reducedMotion', () => {
    useSettings.getState().setReducedMotion(true);
    expect(useSettings.getState().reducedMotion).toBe(true);
  });

  it('setHighContrast updates highContrast', () => {
    useSettings.getState().setHighContrast(true);
    expect(useSettings.getState().highContrast).toBe(true);
  });
});

describe('useSettings — persist rehydration', () => {
  it('rehydrates state from AsyncStorage', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage') as {
      getItem: jest.Mock;
    };
    const stored = {
      state: {
        reminderEnabled: true,
        reminderTime: '09:00',
        fontSize: 'lg',
        reducedMotion: true,
        highContrast: true,
      },
      version: 0,
    };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(stored));

    await useSettings.persist.rehydrate();

    const s = useSettings.getState();
    expect(s.reminderEnabled).toBe(true);
    expect(s.reminderTime).toBe('09:00');
    expect(s.fontSize).toBe('lg');
    expect(s.reducedMotion).toBe(true);
    expect(s.highContrast).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx jest src/core/settings/__tests__/store.test.ts`
Expected: FAIL with "Cannot find module '../store'"

- [ ] **Step 3: Implement `src/core/settings/store.ts`**

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'sm' | 'md' | 'lg';

interface SettingsState {
  reminderEnabled: boolean;
  reminderTime: string;
  fontSize: FontSize;
  reducedMotion: boolean;
  highContrast: boolean;
  setReminderEnabled: (value: boolean) => void;
  setReminderTime: (value: string) => void;
  setFontSize: (value: FontSize) => void;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      reminderEnabled: false,
      reminderTime: '20:00',
      fontSize: 'md',
      reducedMotion: false,
      highContrast: false,
      setReminderEnabled: (value) => set({ reminderEnabled: value }),
      setReminderTime: (value) => set({ reminderTime: value }),
      setFontSize: (value) => set({ fontSize: value }),
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setHighContrast: (value) => set({ highContrast: value }),
    }),
    {
      name: 'cbt-toolkit-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx jest src/core/settings/__tests__/store.test.ts`
Expected: `6 passed` (5 setter/default + 1 rehydration)

- [ ] **Step 5: Commit**
```bash
git add src/core/settings/
git commit -m "feat: add settings store (Zustand + AsyncStorage persist)"
```

---

### Task 3: fontScale + highContrastColors + useColors (TDD)

**Files:**
- Create: `src/core/settings/__tests__/fontScale.test.ts`
- Create: `src/core/settings/fontScale.ts`
- Modify: `src/core/theme/index.ts`
- Create: `src/core/theme/useColors.ts`

- [ ] **Step 1: Write failing fontScale tests**

Create `src/core/settings/__tests__/fontScale.test.ts`:

```ts
import { scaledFont } from '../fontScale';

describe('scaledFont', () => {
  it("'sm' multiplier = 0.875", () => {
    expect(scaledFont(16, 'sm')).toBeCloseTo(14);
  });

  it("'md' multiplier = 1.0", () => {
    expect(scaledFont(16, 'md')).toBe(16);
  });

  it("'lg' multiplier = 1.2", () => {
    expect(scaledFont(16, 'lg')).toBeCloseTo(19.2);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx jest src/core/settings/__tests__/fontScale.test.ts`
Expected: FAIL — "Cannot find module '../fontScale'"

- [ ] **Step 3: Implement `src/core/settings/fontScale.ts`**

```ts
import type { FontSize } from './store';

const MULTIPLIERS: Record<FontSize, number> = {
  sm: 0.875,
  md: 1.0,
  lg: 1.2,
};

export function scaledFont(base: number, size: FontSize): number {
  return base * MULTIPLIERS[size];
}
```

- [ ] **Step 4: Run fontScale tests — expect PASS**

Run: `npx jest src/core/settings/__tests__/fontScale.test.ts`
Expected: `3 passed`

- [ ] **Step 5: Add `highContrastColors` to `src/core/theme/index.ts`**

Append after the `colors` export (keep all existing code, just add the new export):

```ts
export const highContrastColors: typeof colors = {
  bg: '#000000',
  surface: '#0D0D0D',
  surfaceRaised: '#1A1A1A',
  border: '#5C5650',
  borderFocus: '#8C8276',
  accent: '#C4956A',
  accentDim: 'rgba(196,149,106,0.20)',
  accentBorder: 'rgba(196,149,106,0.40)',
  text: '#FFFFFF',
  textMuted: '#B0A898',
  textDim: '#6B6560',
  danger: '#E8706A',
  dangerDim: 'rgba(232,112,106,0.20)',
  success: '#8BBF90',
  inProgress: '#D4AF6A',
} as const;
```

- [ ] **Step 6: Create `src/core/theme/useColors.ts`**

```ts
import { colors, highContrastColors } from './index';
import { useSettings } from '../settings/store';

export function useColors() {
  const highContrast = useSettings((s) => s.highContrast);
  return highContrast ? highContrastColors : colors;
}
```

- [ ] **Step 7: Write useColors tests**

Create `src/core/theme/__tests__/useColors.test.ts`:

```ts
jest.mock('../settings/store', () => ({
  useSettings: jest.fn(),
}));

import { useColors } from '../useColors';
import { useSettings } from '../settings/store';
import { colors, highContrastColors } from '../index';

describe('useColors', () => {
  it('returns colors when highContrast is false', () => {
    (useSettings as jest.Mock).mockImplementation((sel: (s: { highContrast: boolean }) => boolean) =>
      sel({ highContrast: false })
    );
    expect(useColors()).toBe(colors);
  });

  it('returns highContrastColors when highContrast is true', () => {
    (useSettings as jest.Mock).mockImplementation((sel: (s: { highContrast: boolean }) => boolean) =>
      sel({ highContrast: true })
    );
    expect(useColors()).toBe(highContrastColors);
  });
});
```

- [ ] **Step 8: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 9: Run full test suite**

Run: `npx jest`
Expected: all 63 tests passing (52 baseline + 6 store + 3 fontScale + 2 useColors = 63)

- [ ] **Step 10: Commit**
```bash
git add src/core/settings/fontScale.ts src/core/settings/__tests__/fontScale.test.ts src/core/theme/index.ts src/core/theme/useColors.ts src/core/theme/__tests__/useColors.test.ts
git commit -m "feat: add scaledFont, highContrastColors, useColors"
```

---

### Task 4: deleteAll() in repositories (TDD)

**Files:**
- Create: `src/tools/thought-record/__tests__/repository.test.ts`
- Modify: `src/tools/thought-record/repository.ts`
- Modify: `src/tools/behavioral-experiment/__tests__/repository.test.ts`
- Modify: `src/tools/behavioral-experiment/repository.ts`

- [ ] **Step 1: Write failing deleteAll test for ThoughtRecordRepository**

Create `src/tools/thought-record/__tests__/repository.test.ts`:

```ts
jest.mock('expo-sqlite');
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-1234',
}));

import * as SQLite from 'expo-sqlite';
import * as repo from '../repository';

const mockDb = {
  runAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
} as unknown as SQLite.SQLiteDatabase;

beforeEach(() => jest.clearAllMocks());

describe('deleteAll', () => {
  it('executes DELETE on thought_records and tool_entries', async () => {
    await repo.deleteAll(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map(
      (c: unknown[]) => c[0] as string
    );
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('thought_records'))).toBe(true);
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('tool_entries'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx jest src/tools/thought-record/__tests__/repository.test.ts`
Expected: FAIL — "repo.deleteAll is not a function"

- [ ] **Step 3: Implement deleteAll in `src/tools/thought-record/repository.ts`**

Append at the end of the file:

```ts
export async function deleteAll(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM thought_records');
  await db.runAsync("DELETE FROM tool_entries WHERE tool_id = 'thought-record'");
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx jest src/tools/thought-record/__tests__/repository.test.ts`
Expected: `1 passed`

- [ ] **Step 5: Write failing deleteAll test for BehavioralExperimentRepository**

Open `src/tools/behavioral-experiment/__tests__/repository.test.ts` and append at the end:

```ts
describe('deleteAll', () => {
  it('executes DELETE on behavioral_experiments and tool_entries', async () => {
    await repo.deleteAll(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map(
      (c: unknown[]) => c[0] as string
    );
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('behavioral_experiments'))).toBe(true);
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('tool_entries'))).toBe(true);
  });
});
```

- [ ] **Step 6: Run test — expect FAIL**

Run: `npx jest src/tools/behavioral-experiment/__tests__/repository.test.ts`
Expected: the new `deleteAll` test FAILS — "repo.deleteAll is not a function"

- [ ] **Step 7: Implement deleteAll in `src/tools/behavioral-experiment/repository.ts`**

Append at the end of the file:

```ts
export async function deleteAll(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM behavioral_experiments');
  await db.runAsync("DELETE FROM tool_entries WHERE tool_id = 'behavioral-experiment'");
}
```

- [ ] **Step 8: Run full test suite — expect PASS**

Run: `npx jest`
Expected: all 65 tests passing (63 from Task 3 + 1 TR deleteAll + 1 BE deleteAll)

- [ ] **Step 9: Commit**
```bash
git add src/tools/thought-record/repository.ts src/tools/thought-record/__tests__/repository.test.ts src/tools/behavioral-experiment/repository.ts src/tools/behavioral-experiment/__tests__/repository.test.ts
git commit -m "feat: add deleteAll() to ThoughtRecord and BehavioralExperiment repositories"
```

---

### Task 5: Notifications module (TDD)

**Files:**
- Create: `src/core/notifications/__tests__/permissions.test.ts`
- Create: `src/core/notifications/permissions.ts`
- Create: `src/core/notifications/__tests__/schedule.test.ts`
- Create: `src/core/notifications/schedule.ts`

- [ ] **Step 1: Write failing permissions tests**

Create `src/core/notifications/__tests__/permissions.test.ts`:

```ts
const mockRequestPermissionsAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: mockRequestPermissionsAsync,
}));

import { requestPermissions } from '../permissions';

beforeEach(() => jest.clearAllMocks());

describe('requestPermissions', () => {
  it('returns true when status is granted', async () => {
    mockRequestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    const result = await requestPermissions();
    expect(result).toBe(true);
  });

  it('returns false when status is denied', async () => {
    mockRequestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const result = await requestPermissions();
    expect(result).toBe(false);
  });

  it('returns false when status is undetermined', async () => {
    mockRequestPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
    const result = await requestPermissions();
    expect(result).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx jest src/core/notifications/__tests__/permissions.test.ts`
Expected: FAIL — "Cannot find module '../permissions'"

- [ ] **Step 3: Implement `src/core/notifications/permissions.ts`**

```ts
import * as Notifications from 'expo-notifications';

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
```

- [ ] **Step 4: Run permissions tests — expect PASS**

Run: `npx jest src/core/notifications/__tests__/permissions.test.ts`
Expected: `3 passed`

- [ ] **Step 5: Write failing schedule tests**

Create `src/core/notifications/__tests__/schedule.test.ts`:

```ts
const mockScheduleNotificationAsync = jest.fn().mockResolvedValue('notification-id');
const mockCancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined);
const mockGetAllScheduledNotificationsAsync = jest.fn().mockResolvedValue([]);

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: mockScheduleNotificationAsync,
  cancelAllScheduledNotificationsAsync: mockCancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync: mockGetAllScheduledNotificationsAsync,
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));

import { scheduleReminder, cancelReminder } from '../schedule';

beforeEach(() => jest.clearAllMocks());

describe('scheduleReminder', () => {
  it('calls scheduleNotificationAsync with correct title, body, and daily trigger for "08:30"', async () => {
    await scheduleReminder('08:30');

    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const call = mockScheduleNotificationAsync.mock.calls[0][0] as {
      content: { title: string; body: string };
      trigger: { type: string; hour: number; minute: number };
    };
    expect(call.content.title).toBe('Czas na refleksję');
    expect(call.content.body).toBe('Zapisz swoje myśli i emocje');
    expect(call.trigger.type).toBe('daily');
    expect(call.trigger.hour).toBe(8);
    expect(call.trigger.minute).toBe(30);
  });

  it('parses "20:00" correctly (hour=20, minute=0)', async () => {
    await scheduleReminder('20:00');

    const call = mockScheduleNotificationAsync.mock.calls[0][0] as {
      trigger: { hour: number; minute: number };
    };
    expect(call.trigger.hour).toBe(20);
    expect(call.trigger.minute).toBe(0);
  });
});

describe('cancelReminder', () => {
  it('calls cancelAllScheduledNotificationsAsync', async () => {
    await cancelReminder();
    expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 6: Run test — expect FAIL**

Run: `npx jest src/core/notifications/__tests__/schedule.test.ts`
Expected: FAIL — "Cannot find module '../schedule'"

- [ ] **Step 7: Implement `src/core/notifications/schedule.ts`**

```ts
import * as Notifications from 'expo-notifications';

export async function scheduleReminder(time: string): Promise<void> {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Czas na refleksję',
      body: 'Zapisz swoje myśli i emocje',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

- [ ] **Step 8: Run schedule tests — expect PASS**

Run: `npx jest src/core/notifications/__tests__/schedule.test.ts`
Expected: `3 passed`

- [ ] **Step 9: Run full test suite**

Run: `npx jest`
Expected: all 71 tests passing (65 + 3 permissions + 3 schedule)

- [ ] **Step 10: Commit**
```bash
git add src/core/notifications/
git commit -m "feat: add notifications permissions and schedule modules"
```

---

### Task 6: Data export (TDD)

**Files:**
- Create: `src/core/data/__tests__/export.test.ts`
- Create: `src/core/data/export.ts`

- [ ] **Step 1: Write failing export tests**

Create `src/core/data/__tests__/export.test.ts`:

```ts
jest.mock('expo-sqlite');
jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import { exportData } from '../export';

const mockDb = {
  getAllAsync: jest.fn(),
} as unknown as SQLite.SQLiteDatabase;

const thoughtRows = [{ id: 'tr1', situation: 'Sytuacja', created_at: '2026-01-01T00:00:00.000Z' }];
const experimentRows = [{ id: 'be1', belief: 'Przekonanie', created_at: '2026-01-01T00:00:00.000Z' }];

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.getAllAsync as jest.Mock)
    .mockResolvedValueOnce(thoughtRows)
    .mockResolvedValueOnce(experimentRows);
});

describe('exportData', () => {
  it('writes JSON with correct shape and calls shareAsync', async () => {
    await exportData(mockDb);

    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
    const [filePath, content] = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0] as [string, string];
    expect(filePath).toMatch(/cbt-export-\d+\.json$/);

    const parsed = JSON.parse(content) as {
      version: number;
      exportedAt: string;
      thoughtRecords: unknown[];
      behavioralExperiments: unknown[];
    };
    expect(parsed.version).toBe(1);
    expect(typeof parsed.exportedAt).toBe('string');
    expect(parsed.thoughtRecords).toEqual(thoughtRows);
    expect(parsed.behavioralExperiments).toEqual(experimentRows);

    expect(Sharing.shareAsync).toHaveBeenCalledWith(filePath, expect.any(Object));
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx jest src/core/data/__tests__/export.test.ts`
Expected: FAIL — "Cannot find module '../export'"

- [ ] **Step 3: Implement `src/core/data/export.ts`**

```ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type * as SQLite from 'expo-sqlite';

export async function exportData(db: SQLite.SQLiteDatabase): Promise<void> {
  const thoughtRecords = await db.getAllAsync(`
    SELECT tr.*, te.is_complete, te.current_step, te.created_at, te.updated_at
    FROM thought_records tr
    JOIN tool_entries te ON tr.id = te.id
    ORDER BY te.created_at ASC
  `);

  const behavioralExperiments = await db.getAllAsync(`
    SELECT be.*, te.is_complete, te.current_step, te.created_at, te.updated_at
    FROM behavioral_experiments be
    JOIN tool_entries te ON be.id = te.id
    ORDER BY te.created_at ASC
  `);

  const exportObj = {
    version: 1,
    exportedAt: new Date().toISOString(),
    thoughtRecords,
    behavioralExperiments,
  };

  const filePath = `${FileSystem.cacheDirectory}cbt-export-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportObj, null, 2));
  await Sharing.shareAsync(filePath, { mimeType: 'application/json' });
}
```

- [ ] **Step 4: Run export tests — expect PASS**

Run: `npx jest src/core/data/__tests__/export.test.ts`
Expected: `1 passed`

- [ ] **Step 5: Run full test suite**

Run: `npx jest`
Expected: all 72 tests passing (71 + 1 export)

- [ ] **Step 6: Commit**
```bash
git add src/core/data/export.ts src/core/data/__tests__/export.test.ts
git commit -m "feat: add data export module"
```

---

### Task 7: Data import (TDD)

**Files:**
- Create: `src/core/data/__tests__/import.test.ts`
- Create: `src/core/data/import.ts`

- [ ] **Step 1: Write failing import tests**

Create `src/core/data/__tests__/import.test.ts`:

```ts
jest.mock('expo-sqlite');
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
}));
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'import-uuid-1234',
}));

import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { importData, validateExportFile } from '../import';

const mockDb = {
  runAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn().mockResolvedValue(null),
} as unknown as SQLite.SQLiteDatabase;

beforeEach(() => jest.clearAllMocks());

const validFile = {
  version: 1,
  exportedAt: '2026-01-01T00:00:00.000Z',
  thoughtRecords: [
    { id: 'tr1', situation: 'Sytuacja', createdAt: '2026-01-01T00:00:00.000Z' },
  ],
  behavioralExperiments: [
    { id: 'be1', belief: 'Przekonanie', createdAt: '2026-01-01T00:00:00.000Z' },
  ],
};

describe('validateExportFile', () => {
  it('returns null for valid file', () => {
    expect(validateExportFile(validFile)).toBeNull();
  });

  it('rejects null', () => {
    expect(validateExportFile(null)).not.toBeNull();
  });

  it('rejects wrong version', () => {
    expect(validateExportFile({ ...validFile, version: 2 })).not.toBeNull();
  });

  it('rejects missing thoughtRecords', () => {
    const { thoughtRecords: _, ...rest } = validFile;
    expect(validateExportFile(rest)).not.toBeNull();
  });

  it('rejects missing behavioralExperiments', () => {
    const { behavioralExperiments: _, ...rest } = validFile;
    expect(validateExportFile(rest)).not.toBeNull();
  });

  it('rejects thought record missing id', () => {
    const bad = { ...validFile, thoughtRecords: [{ situation: 'x', createdAt: '2026-01-01T00:00:00.000Z' }] };
    expect(validateExportFile(bad)).not.toBeNull();
  });

  it('rejects experiment missing belief', () => {
    const bad = { ...validFile, behavioralExperiments: [{ id: 'x', createdAt: '2026-01-01T00:00:00.000Z' }] };
    expect(validateExportFile(bad)).not.toBeNull();
  });

  it('rejects total count > 5000', () => {
    const big = {
      ...validFile,
      thoughtRecords: Array.from({ length: 5001 }, (_, i) => ({
        id: `tr${i}`, situation: 'x', createdAt: '2026-01-01T00:00:00.000Z',
      })),
    };
    expect(validateExportFile(big)).not.toBeNull();
  });
});

describe('importData', () => {
  it('inserts records and returns imported/skipped counts', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(validFile)
    );

    const result = await importData(mockDb, 'file:///test.json');

    expect(result.imported).toBe(2); // 1 thought record + 1 experiment
    expect(result.skipped).toBe(0);
    expect(
      (mockDb.runAsync as jest.Mock).mock.calls.filter((c: unknown[]) =>
        (c[0] as string).includes('tool_entries')
      ).length
    ).toBeGreaterThanOrEqual(2);
  });

  it('skips records with duplicate ids', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(validFile)
    );
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValue({ id: 'exists' });

    const result = await importData(mockDb, 'file:///test.json');
    expect(result.skipped).toBe(2);
    expect(result.imported).toBe(0);
  });

  it('throws on invalid JSON', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce('not json {{{');
    await expect(importData(mockDb, 'file:///bad.json')).rejects.toThrow();
  });

  it('throws with human-readable Polish message on validation failure', async () => {
    const invalidFile = { version: 99, thoughtRecords: [], behavioralExperiments: [] };
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(invalidFile)
    );
    await expect(importData(mockDb, 'file:///bad.json')).rejects.toThrow(
      'Nieznana wersja pliku'
    );
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx jest src/core/data/__tests__/import.test.ts`
Expected: FAIL — "Cannot find module '../import'"

- [ ] **Step 3: Implement `src/core/data/import.ts`**

```ts
import * as FileSystem from 'expo-file-system';
import type * as SQLite from 'expo-sqlite';

interface RawRecord {
  id?: unknown;
  situation?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  [key: string]: unknown;
}

interface RawExperiment {
  id?: unknown;
  belief?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  [key: string]: unknown;
}

interface ExportFile {
  version?: unknown;
  thoughtRecords?: unknown;
  behavioralExperiments?: unknown;
  [key: string]: unknown;
}

/** Returns null if valid, or an error string describing the problem. */
export function validateExportFile(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return 'Plik nie jest obiektem JSON';
  const f = data as ExportFile;
  if (f.version !== 1) return 'Nieznana wersja pliku (oczekiwano 1)';
  if (!Array.isArray(f.thoughtRecords)) return 'Brak tablicy thoughtRecords';
  if (!Array.isArray(f.behavioralExperiments)) return 'Brak tablicy behavioralExperiments';
  const total = (f.thoughtRecords as unknown[]).length + (f.behavioralExperiments as unknown[]).length;
  if (total > 5000) return `Zbyt wiele rekordów (${total} > 5000)`;
  for (const r of f.thoughtRecords as RawRecord[]) {
    if (typeof r.id !== 'string' || !r.id) return 'Rekord myśli bez poprawnego id';
    if (typeof r.situation !== 'string' || !r.situation) return 'Rekord myśli bez pola situation';
    const ca = r.createdAt ?? r.created_at;
    if (typeof ca !== 'string' || !ca) return 'Rekord myśli bez createdAt';
  }
  for (const e of f.behavioralExperiments as RawExperiment[]) {
    if (typeof e.id !== 'string' || !e.id) return 'Eksperyment bez poprawnego id';
    if (typeof e.belief !== 'string' || !e.belief) return 'Eksperyment bez pola belief';
    const ca = e.createdAt ?? e.created_at;
    if (typeof ca !== 'string' || !ca) return 'Eksperyment bez createdAt';
  }
  return null;
}

export async function importData(
  db: SQLite.SQLiteDatabase,
  fileUri: string
): Promise<{ imported: number; skipped: number }> {
  const raw = await FileSystem.readAsStringAsync(fileUri);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Nieprawidłowy JSON');
  }

  const error = validateExportFile(parsed);
  if (error) throw new Error(error);

  const file = parsed as { thoughtRecords: RawRecord[]; behavioralExperiments: RawExperiment[] };
  const now = new Date().toISOString();
  let imported = 0;
  let skipped = 0;

  for (const r of file.thoughtRecords) {
    const id = r.id as string;
    const existing = await db.getFirstAsync('SELECT id FROM tool_entries WHERE id = ?', [id]);
    if (existing) { skipped++; continue; }
    const createdAt = (r.createdAt ?? r.created_at) as string;
    await db.runAsync(
      `INSERT INTO tool_entries (id, tool_id, created_at, updated_at, is_complete, current_step) VALUES (?, 'thought-record', ?, ?, ?, ?)`,
      [id, createdAt, now, r.is_complete ?? 0, r.current_step ?? 1]
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO thought_records (id, situation, emotions, automatic_thoughts, evidence_for, evidence_against, alternative_thought, outcome, is_example, situation_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        r.situation as string,
        typeof r.emotions === 'string' ? r.emotions : JSON.stringify(r.emotions ?? []),
        r.automatic_thoughts ?? '',
        r.evidence_for ?? '',
        r.evidence_against ?? '',
        r.alternative_thought ?? '',
        r.outcome ?? null,
        r.is_example ? 1 : 0,
        r.situation_date ?? null,
      ]
    );
    imported++;
  }

  for (const e of file.behavioralExperiments) {
    const id = e.id as string;
    const existing = await db.getFirstAsync('SELECT id FROM tool_entries WHERE id = ?', [id]);
    if (existing) { skipped++; continue; }
    const createdAt = (e.createdAt ?? e.created_at) as string;
    await db.runAsync(
      `INSERT INTO tool_entries (id, tool_id, created_at, updated_at, is_complete, current_step) VALUES (?, 'behavioral-experiment', ?, ?, ?, ?)`,
      [id, createdAt, now, e.is_complete ?? 0, e.current_step ?? 1]
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO behavioral_experiments (id, status, belief, belief_strength_before, alternative_belief, plan, predicted_outcome, execution_date, execution_notes, actual_outcome, conclusion, belief_strength_after, is_example) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        e.status ?? 'planned',
        e.belief as string,
        e.belief_strength_before ?? 50,
        e.alternative_belief ?? '',
        e.plan ?? '',
        e.predicted_outcome ?? '',
        e.execution_date ?? null,
        e.execution_notes ?? null,
        e.actual_outcome ?? null,
        e.conclusion ?? null,
        e.belief_strength_after ?? null,
        e.is_example ? 1 : 0,
      ]
    );
    imported++;
  }

  return { imported, skipped };
}
```

- [ ] **Step 4: Run import tests — expect PASS**

Run: `npx jest src/core/data/__tests__/import.test.ts`
Expected: `12 passed`

- [ ] **Step 5: Run full test suite**

Run: `npx jest`
Expected: all 84 tests passing (72 + 8 validateExportFile + 4 importData)

- [ ] **Step 6: Commit**
```bash
git add src/core/data/import.ts src/core/data/__tests__/import.test.ts
git commit -m "feat: add data import module with validation"
```

---

### Task 8: Settings screen — folder structure + UI

**Files:**
- Delete: `src/app/settings.tsx`
- Create: `src/app/settings/_layout.tsx`
- Create: `src/app/settings/index.tsx`

Includes basic render tests required by the spec.

- [ ] **Step 1: Write failing screen render tests**

Create `src/app/settings/__tests__/index.test.tsx`:

```tsx
jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn().mockReturnValue({}) }));
jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn(), back: jest.fn() }),
}));
jest.mock('expo-constants', () => ({ default: { expoConfig: { version: '1.0.0' } } }));
jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));
jest.mock('expo-linking', () => ({ openURL: jest.fn(), openSettings: jest.fn() }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../index';

describe('SettingsScreen', () => {
  it('renders all 5 section headers', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Powiadomienia')).toBeTruthy();
    expect(screen.getByText('Dostępność')).toBeTruthy();
    expect(screen.getByText('Dane')).toBeTruthy();
    expect(screen.getByText('Zasoby pomocowe')).toBeTruthy();
    expect(screen.getByText('O aplikacji')).toBeTruthy();
  });

  it('hides time row when reminderEnabled is false (default)', () => {
    render(<SettingsScreen />);
    expect(screen.queryByText('Godzina przypomnienia')).toBeNull();
  });

  it('font size selector shows 3 options', () => {
    render(<SettingsScreen />);
    // All three A labels are rendered
    const fontLabels = screen.getAllByText('A');
    expect(fontLabels.length).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx jest src/app/settings/__tests__/index.test.tsx`
Expected: FAIL — "Cannot find module '../index'"

- [ ] **Step 3: Delete the placeholder**

Delete `src/app/settings.tsx`.

- [ ] **Step 4: Create `src/app/settings/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 5: Create `src/app/settings/index.tsx`**

```tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';

import { useSettings } from '../../core/settings/store';
import { useColors } from '../../core/theme/useColors';
import { scaledFont } from '../../core/settings/fontScale';
import { requestPermissions } from '../../core/notifications/permissions';
import { scheduleReminder, cancelReminder } from '../../core/notifications/schedule';
import { exportData } from '../../core/data/export';
import { importData } from '../../core/data/import';
import * as ThoughtRecordRepo from '../../tools/thought-record/repository';
import * as ExperimentRepo from '../../tools/behavioral-experiment/repository';
import { pl } from '../../core/i18n/pl';
import { spacing, radius } from '../../core/theme';

const GITHUB_RELEASES = 'https://github.com/your-org/cbt-toolkit/releases';
const GITHUB_ISSUES = 'https://github.com/your-org/cbt-toolkit/issues';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useColors();
  const {
    reminderEnabled, reminderTime, fontSize, reducedMotion, highContrast,
    setReminderEnabled, setReminderTime, setFontSize, setReducedMotion, setHighContrast,
  } = useSettings();

  const [showTimePicker, setShowTimePicker] = useState(false);

  const reminderDate = (() => {
    const [h, m] = reminderTime.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  })();

  const fs = (base: number) => scaledFont(base, fontSize);

  async function handleToggleReminder(value: boolean) {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          pl.settings.notifications.permissionDenied,
          '',
          [
            { text: pl.common.cancel, style: 'cancel' },
            { text: pl.settings.notifications.permissionDeniedBtn, onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      await scheduleReminder(reminderTime);
      setReminderEnabled(true);
    } else {
      await cancelReminder();
      setReminderEnabled(false);
    }
  }

  async function handleTimeChange(_event: unknown, date?: Date) {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (!date) return;
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const newTime = `${h}:${m}`;
    setReminderTime(newTime);
    if (reminderEnabled) {
      await cancelReminder();
      await scheduleReminder(newTime);
    }
  }

  async function handleExport() {
    try {
      await exportData(db);
    } catch {
      Alert.alert('Błąd', 'Nie udało się wyeksportować danych.');
    }
  }

  async function handleImport() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled || !result.assets?.[0]) return;
      const { imported, skipped } = await importData(db, result.assets[0].uri);
      Alert.alert('Importowano', `Dodano: ${imported}, pominięto: ${skipped}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : pl.settings.data.importError;
      Alert.alert('Błąd importu', msg);
    }
  }

  function handleDeleteAll() {
    Alert.alert(
      pl.settings.data.deleteConfirmTitle,
      pl.settings.data.deleteConfirmMsg,
      [
        { text: pl.common.cancel, style: 'cancel' },
        {
          text: pl.common.delete,
          style: 'destructive',
          onPress: async () => {
            await ThoughtRecordRepo.deleteAll(db);
            await ExperimentRepo.deleteAll(db);
            Alert.alert('Gotowe', 'Wszystkie dane zostały usunięte.');
          },
        },
      ]
    );
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { paddingTop: 56, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
    headerTitle: { fontSize: fs(22), fontWeight: '700', color: colors.text },
    sectionHeader: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xs },
    sectionTitle: { fontSize: fs(11), fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    card: { marginHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14 },
    rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    rowLabel: { flex: 1 },
    rowLabelText: { fontSize: fs(15), color: colors.text, fontWeight: '500' },
    rowSubText: { fontSize: fs(12), color: colors.textMuted, marginTop: 2 },
    rowValue: { fontSize: fs(15), color: colors.textMuted, marginRight: spacing.xs },
    chevron: { fontSize: 18, color: colors.textDim },
    dangerText: { fontSize: fs(15), color: colors.danger, fontWeight: '500' },
    fontSelector: { flexDirection: 'row', gap: spacing.xs },
    fontOption: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    fontOptionActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
    fontOptionText: { color: colors.textMuted, fontWeight: '600' },
    fontOptionTextActive: { color: colors.accent },
    appBlock: { paddingHorizontal: spacing.md, paddingVertical: 14 },
    appName: { fontSize: fs(16), fontWeight: '700', color: colors.text },
    appVersion: { fontSize: fs(12), color: colors.textMuted, marginTop: 2 },
  });

  const fontSizes: Array<{ key: 'sm' | 'md' | 'lg'; label: string; size: number }> = [
    { key: 'sm', label: 'A', size: 12 },
    { key: 'md', label: 'A', size: 15 },
    { key: 'lg', label: 'A', size: 18 },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{pl.nav.settings}</Text>
      </View>

      {/* Powiadomienia */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.notifications.title}</Text>
      </View>
      <View style={s.card}>
        <View style={s.row}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.notifications.reminder}</Text>
            <Text style={s.rowSubText}>{pl.settings.notifications.reminderSub}</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={handleToggleReminder}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.text}
          />
        </View>
        {reminderEnabled && (
          <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => setShowTimePicker(true)}>
            <View style={s.rowLabel}>
              <Text style={s.rowLabelText}>{pl.settings.notifications.time}</Text>
            </View>
            <Text style={s.rowValue}>{reminderTime}</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dostępność */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.accessibility.title}</Text>
      </View>
      <View style={s.card}>
        <View style={s.row}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.accessibility.fontSize}</Text>
          </View>
          <View style={s.fontSelector}>
            {fontSizes.map(({ key, label, size }) => (
              <TouchableOpacity
                key={key}
                style={[s.fontOption, fontSize === key && s.fontOptionActive]}
                onPress={() => setFontSize(key)}
              >
                <Text style={[s.fontOptionText, { fontSize: size }, fontSize === key && s.fontOptionTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[s.row, s.rowBorder]}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.accessibility.reducedMotion}</Text>
            <Text style={s.rowSubText}>{pl.settings.accessibility.reducedMotionSub}</Text>
          </View>
          <Switch value={reducedMotion} onValueChange={setReducedMotion} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.text} />
        </View>
        <View style={[s.row, s.rowBorder]}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.accessibility.highContrast}</Text>
            <Text style={s.rowSubText}>{pl.settings.accessibility.highContrastSub}</Text>
          </View>
          <Switch value={highContrast} onValueChange={setHighContrast} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.text} />
        </View>
      </View>

      {/* Dane */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.data.title}</Text>
      </View>
      <View style={s.card}>
        <TouchableOpacity style={s.row} onPress={handleExport}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.data.export}</Text>
            <Text style={s.rowSubText}>{pl.settings.data.exportSub}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={handleImport}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.data.import}</Text>
            <Text style={s.rowSubText}>{pl.settings.data.importSub}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={handleDeleteAll}>
          <View style={s.rowLabel}>
            <Text style={s.dangerText}>{pl.settings.data.deleteAll}</Text>
            <Text style={s.rowSubText}>{pl.settings.data.deleteAllSub}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Zasoby pomocowe */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.resources.title}</Text>
      </View>
      <View style={s.card}>
        <TouchableOpacity style={s.row} onPress={() => Linking.openURL('tel:116123')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.resources.adults}</Text>
            <Text style={s.rowSubText}>116 123</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => Linking.openURL('tel:116111')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.resources.children}</Text>
            <Text style={s.rowSubText}>116 111</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => Linking.openURL('https://centrumwsparcia.pl')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.resources.centrum}</Text>
            <Text style={s.rowSubText}>centrumwsparcia.pl</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* O aplikacji */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.about.title}</Text>
      </View>
      <View style={s.card}>
        <View style={s.appBlock}>
          <Text style={s.appName}>{pl.app.title}</Text>
          <Text style={s.appVersion}>v{Constants.expoConfig?.version ?? '—'}</Text>
        </View>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => router.push('/settings/credits')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.about.credits}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => router.push('/settings/bibliography')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.about.bibliography}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => Linking.openURL(GITHUB_RELEASES)}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.about.changelog}</Text>
            <Text style={s.rowSubText}>{pl.settings.about.changelogSub}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => Linking.openURL(GITHUB_ISSUES)}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.about.report}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Time picker */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showTimePicker} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg }}>
              <DateTimePicker
                value={reminderDate}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor={colors.text}
              />
              <TouchableOpacity
                style={{ alignItems: 'center', paddingVertical: spacing.sm }}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={{ color: colors.accent, fontSize: fs(16), fontWeight: '600' }}>
                  {pl.common.done}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : (
        showTimePicker && (
          <DateTimePicker
            value={reminderDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )
      )}
    </ScrollView>
  );
}
```

- [ ] **Step 6: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors. If TS errors appear, fix them before committing.

- [ ] **Step 7: Run full test suite — including screen tests**

Run: `npx jest`
Expected: all 87 tests passing (84 + 3 screen render)

- [ ] **Step 8: Commit**
```bash
git rm src/app/settings.tsx
git add src/app/settings/
git commit -m "feat: implement settings screen with all 5 sections"
```

---

### Task 9: Static screens (Credits + Bibliography)

**Files:**
- Create: `src/app/settings/credits.tsx`
- Create: `src/app/settings/bibliography.tsx`

- [ ] **Step 1: Create `src/app/settings/credits.tsx`**

```tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '../../core/theme/useColors';
import { useSettings } from '../../core/settings/store';
import { scaledFont } from '../../core/settings/fontScale';
import { spacing, radius } from '../../core/theme';

export default function CreditsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { fontSize } = useSettings();
  const fs = (base: number) => scaledFont(base, fontSize);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    backText: { fontSize: fs(16), color: colors.accent, marginRight: spacing.sm },
    headerTitle: { fontSize: fs(20), fontWeight: '700', color: colors.text },
    card: { margin: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
    sectionTitle: { fontSize: fs(12), fontWeight: '700', color: colors.accent, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
    body: { fontSize: fs(14), color: colors.text, lineHeight: 22 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
    packageRow: { flexDirection: 'row', marginBottom: spacing.xs },
    packageName: { fontSize: fs(13), color: colors.accent, width: 180 },
    packageDesc: { fontSize: fs(13), color: colors.textMuted, flex: 1 },
  });

  const packages: Array<[string, string]> = [
    ['React Native', 'Interfejs użytkownika'],
    ['Expo', 'Platforma mobilna'],
    ['Zustand', 'Zarządzanie stanem'],
    ['expo-sqlite', 'Lokalna baza danych'],
    ['expo-notifications', 'Powiadomienia lokalne'],
    ['@react-native-community/datetimepicker', 'Picker czasu'],
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backText}>‹ Wstecz</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Twórcy i podziękowania</Text>
      </View>
      <View style={s.card}>
        <Text style={s.sectionTitle}>Autorzy</Text>
        <Text style={s.body}>
          Aplikacja Zestaw Narzędzi TPB jest projektem open-source stworzonym z myślą
          o osobach korzystających z terapii poznawczo-behawioralnej. Kod źródłowy
          dostępny na GitHub.
        </Text>
        <View style={s.divider} />
        <Text style={s.sectionTitle}>Biblioteki open-source</Text>
        {packages.map(([name, desc]) => (
          <View key={name} style={s.packageRow}>
            <Text style={s.packageName}>{name}</Text>
            <Text style={s.packageDesc}>{desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Create `src/app/settings/bibliography.tsx`**

```tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '../../core/theme/useColors';
import { useSettings } from '../../core/settings/store';
import { scaledFont } from '../../core/settings/fontScale';
import { spacing, radius } from '../../core/theme';

const REFERENCES = [
  { author: 'Beck, A. T.', year: '1979', title: 'Cognitive Therapy of Depression', publisher: 'Guilford Press' },
  { author: 'Burns, D. D.', year: '1980', title: 'Feeling Good: The New Mood Therapy', publisher: 'William Morrow' },
  { author: 'Beck, J. S.', year: '2011', title: 'Cognitive Behavior Therapy: Basics and Beyond (2nd ed.)', publisher: 'Guilford Press' },
  { author: 'Popiel, A., Pragłowska, E.', year: '2008', title: 'Psychoterapia poznawczo-behawioralna: Teoria i praktyka', publisher: 'Paradygmat, Warszawa' },
  { author: 'Bennett-Levy, J. et al.', year: '2004', title: 'Oxford Guide to Behavioural Experiments in Cognitive Therapy', publisher: 'Oxford University Press' },
];

export default function BibliographyScreen() {
  const router = useRouter();
  const colors = useColors();
  const { fontSize } = useSettings();
  const fs = (base: number) => scaledFont(base, fontSize);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    backText: { fontSize: fs(16), color: colors.accent, marginRight: spacing.sm },
    headerTitle: { fontSize: fs(20), fontWeight: '700', color: colors.text },
    card: { margin: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
    ref: { marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    refLast: { marginBottom: 0, paddingBottom: 0, borderBottomWidth: 0 },
    refAuthor: { fontSize: fs(14), color: colors.text, fontWeight: '600' },
    refTitle: { fontSize: fs(14), color: colors.accent, fontStyle: 'italic', marginTop: 2 },
    refMeta: { fontSize: fs(12), color: colors.textMuted, marginTop: 2 },
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backText}>‹ Wstecz</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Źródła i bibliografia</Text>
      </View>
      <View style={s.card}>
        {REFERENCES.map((ref, i) => (
          <View key={ref.author} style={i === REFERENCES.length - 1 ? s.refLast : s.ref}>
            <Text style={s.refAuthor}>{ref.author} ({ref.year})</Text>
            <Text style={s.refTitle}>{ref.title}</Text>
            <Text style={s.refMeta}>{ref.publisher}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Run full test suite**

Run: `npx jest`
Expected: all tests passing

- [ ] **Step 5: Commit**
```bash
git add src/app/settings/credits.tsx src/app/settings/bibliography.tsx
git commit -m "feat: add static credits and bibliography screens"
```

---

### Task 10: App launch notification sync

**Files:**
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Add imports to `src/app/_layout.tsx`**

Add these imports at the top of the file (after existing imports):

```ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useSettings } from '../core/settings/store';
import { scheduleReminder } from '../core/notifications/schedule';
```

- [ ] **Step 2: Add launch sync inside `RootLayout`**

Inside the `RootLayout` function, before the `return` statement, add:

```ts
const reminderEnabled = useSettings((s) => s.reminderEnabled);
const reminderTime = useSettings((s) => s.reminderTime);

useEffect(() => {
  if (!reminderEnabled) return;
  Notifications.getAllScheduledNotificationsAsync().then((scheduled) => {
    if (scheduled.length === 0) {
      scheduleReminder(reminderTime);
    }
  });
}, [reminderEnabled, reminderTime]);
```

The deps array `[reminderEnabled, reminderTime]` satisfies `react-hooks/exhaustive-deps` (no ESLint CI failure) and is semantically correct: the sync runs on mount and re-runs if the user changes their reminder settings while the app is running.

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Run full test suite**

Run: `npx jest`
Expected: all tests passing

- [ ] **Step 5: Commit**
```bash
git add src/app/_layout.tsx
git commit -m "feat: sync notification schedule on app launch"
```

---

## Final Verification

After Task 10, run:

```bash
npx jest && npx tsc --noEmit && npx eslint .
```

Expected: 0 errors, 0 warnings, all tests pass.

Then use `superpowers:finishing-a-development-branch` to create the PR.
