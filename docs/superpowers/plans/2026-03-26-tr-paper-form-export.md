# Thought Record — Paper Form View + Export — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dodać nowy ekran `RecordFormScreen` odwzorowujący papierowy formularz "Zapis Myśli" oraz umożliwić eksport do PDF (`expo-print`) i PNG (`react-native-view-shot`).

**Architecture:** Nowy screen `RecordFormScreen` renderuje formularz w ciemnym stylu aplikacji. Eksport PDF generuje biały HTML string przez `expo-print.printToFileAsync`. Eksport PNG przechwytuje widok przez `react-native-view-shot.captureRef`. Oba eksporty kończą się `expo-sharing.shareAsync`. Nowy route `[id]/form.tsx` + przycisk w `RecordDetailScreen`.

**Tech Stack:** expo-print (nowa dep), react-native-view-shot (nowa dep), expo-sharing (już zainstalowane), React Native, TypeScript, Jest

---

## Files changed

| Plik | Zmiana |
|---|---|
| `src/tools/thought-record/i18n/pl.ts` | nowe klucze `form.*` |
| `src/tools/thought-record/screens/RecordFormScreen.tsx` | nowy ekran |
| `src/tools/thought-record/screens/RecordDetailScreen.tsx` | przycisk "Formularz" |
| `src/app/(tools)/thought-record/[id]/form.tsx` | nowy route |

---

## Task 0: Worktree setup + instalacja zależności

- [ ] **Stwórz worktree**

```bash
git worktree add .worktrees/feat-tr-form-export -b feat/tr-form-export
cd .worktrees/feat-tr-form-export
```

- [ ] **Zainstaluj nowe zależności**

```bash
npx expo install expo-print react-native-view-shot
```

- [ ] **Zweryfikuj że zainstalowane wersje są kompatybilne z Expo SDK 55**

```bash
npx expo install --check 2>&1 | tail -10
```

Oczekiwane: brak ostrzeżeń o niekompatybilności.

- [ ] **Baseline testów**

```bash
npx jest --testPathPattern="thought-record" 2>&1 | tail -5
```

Oczekiwane: wszystkie testy przechodzą.

- [ ] **Commit zależności**

```bash
git add package.json package-lock.json
git commit -m "feat(tr): install expo-print and react-native-view-shot"
```

---

## Task 1: i18n — nowe klucze

**Files:**
- Modify: `src/tools/thought-record/i18n/pl.ts`

- [ ] **Dodaj sekcję `form` do obiektu `pl` (na końcu, przed zamknięciem `}`)**

Otwórz `src/tools/thought-record/i18n/pl.ts` i dodaj po kluczu `onboarding`:

```typescript
  form: {
    title: 'Formularz Zapisu Myśli',
    btn: 'Formularz',
    sections: {
      situation: 'Sytuacja',
      emotionsBefore: 'Emocje przed',
      automaticThought: 'Myśl automatyczna',
      evidenceFor: 'Dowody potwierdzające',
      evidenceAgainst: 'Dowody przeczące',
      alternativeThought: 'Myśli alternatywne',
      emotionsAfter: 'Emocje po',
    },
    export: {
      pdf: 'Eksportuj PDF',
      png: 'Eksportuj PNG',
      errorTitle: 'Błąd eksportu',
      errorMsg: 'Nie udało się wyeksportować formularza. Spróbuj ponownie.',
    },
  },
```

- [ ] **Commit**

```bash
git add src/tools/thought-record/i18n/pl.ts
git commit -m "feat(tr): add i18n keys for paper form screen"
```

---

## Task 2: RecordFormScreen — widok + eksport

**Files:**
- Create: `src/tools/thought-record/screens/RecordFormScreen.tsx`

- [ ] **Stwórz plik**

```typescript
// src/tools/thought-record/screens/RecordFormScreen.tsx
import React, { useRef, useCallback } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '../../../core/theme';
import { useThoughtRecord } from '../hooks/useThoughtRecords';
import { pl } from '../i18n/pl';
import type { Emotion } from '../types';

interface Props { id: string; }

export function RecordFormScreen({ id }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const { record, loading } = useThoughtRecord(db, id);
  const formRef = useRef<View>(null);

  const handleExportPdf = useCallback(async () => {
    if (!record) return;
    try {
      const html = buildHtml(record);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } catch {
      Alert.alert(pl.form.export.errorTitle, pl.form.export.errorMsg);
    }
  }, [record]);

  const handleExportPng = useCallback(async () => {
    if (!formRef.current) return;
    try {
      const uri = await captureRef(formRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch {
      Alert.alert(pl.form.export.errorTitle, pl.form.export.errorMsg);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.centered}>
        <Text style={styles.missing}>Nie znaleziono wpisu.</Text>
      </View>
    );
  }

  const emotionsBefore = record.emotions.filter(e => e.intensityBefore !== undefined);
  const emotionsAfter = record.emotions.filter(e => e.intensityAfter !== undefined);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Formularz — ref do capture PNG */}
      <View ref={formRef} style={styles.form} collapsable={false}>
        <Text style={styles.formTitle}>{pl.form.title}</Text>
        <View style={styles.accentLine} />

        <FormSection label={pl.form.sections.situation}>
          <Text style={styles.fieldText}>{record.situation || '—'}</Text>
        </FormSection>

        <FormSection label={pl.form.sections.emotionsBefore}>
          {emotionsBefore.length === 0
            ? <Text style={styles.fieldText}>—</Text>
            : emotionsBefore.map(em => (
              <Text key={em.name} style={styles.fieldText}>
                {em.name}  {em.intensityBefore}%
              </Text>
            ))
          }
        </FormSection>

        {/* 3-column row */}
        <View style={styles.threeCol}>
          <View style={[styles.col, styles.colLeft]}>
            <Text style={styles.colLabel}>{pl.form.sections.automaticThought}</Text>
            <Text style={styles.colText}>{record.automaticThoughts || '—'}</Text>
          </View>
          <View style={[styles.col, styles.colMid]}>
            <Text style={styles.colLabel}>{pl.form.sections.evidenceFor}</Text>
            <Text style={styles.colText}>{record.evidenceFor || '—'}</Text>
          </View>
          <View style={[styles.col, styles.colRight]}>
            <Text style={styles.colLabel}>{pl.form.sections.evidenceAgainst}</Text>
            <Text style={styles.colText}>{record.evidenceAgainst || '—'}</Text>
          </View>
        </View>

        <FormSection label={pl.form.sections.alternativeThought}>
          <Text style={styles.fieldText}>{record.alternativeThought || '—'}</Text>
        </FormSection>

        <FormSection label={pl.form.sections.emotionsAfter} last>
          {emotionsAfter.length === 0
            ? <Text style={styles.fieldText}>—</Text>
            : emotionsAfter.map(em => (
              <Text key={em.name} style={styles.fieldText}>
                {em.name}  {em.intensityAfter}%
              </Text>
            ))
          }
        </FormSection>
      </View>

      {/* Przyciski eksportu */}
      <View style={styles.exportRow}>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportPdf} activeOpacity={0.8}>
          <Text style={styles.exportBtnText}>{pl.form.export.pdf}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportPng} activeOpacity={0.8}>
          <Text style={styles.exportBtnText}>{pl.form.export.png}</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

function FormSection({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[styles.section, last && styles.sectionLast]}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function buildHtml(record: {
  situation: string;
  emotions: Emotion[];
  automaticThoughts: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  outcome: string | null;
}): string {
  const accent = '#C4956A';

  const emotionsBefore = record.emotions
    .filter(e => e.intensityBefore !== undefined)
    .map(e => `${e.name} ${e.intensityBefore}%`)
    .join('<br>') || '—';

  const emotionsAfter = record.emotions
    .filter(e => e.intensityAfter !== undefined)
    .map(e => `${e.name} ${e.intensityAfter}%`)
    .join('<br>') || '—';

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Arial, sans-serif; color: #111; background: #fff; padding: 32px; font-size: 13px; line-height: 1.5; }
  h1 { text-align: center; font-size: 16px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
  .accent-line { border: none; border-top: 2px solid ${accent}; margin-bottom: 20px; }
  .section { margin-bottom: 0; }
  .section-label { font-size: 9px; color: ${accent}; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; padding: 8px 10px 4px; }
  .section-value { font-size: 13px; padding: 4px 10px 12px; min-height: 56px; border-bottom: 1px solid #ddd; }
  .three-col { display: flex; border-bottom: 1px solid #ddd; }
  .col { flex: 1; padding: 8px 10px; border-right: 1px solid #ddd; min-height: 120px; }
  .col:last-child { border-right: none; }
  .col-label { font-size: 9px; color: ${accent}; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 6px; }
  .col-value { font-size: 13px; }
  .outer { border: 1px solid #ddd; }
</style>
</head>
<body>
<h1>Formularz Zapisu Myśli</h1>
<hr class="accent-line">
<div class="outer">
  <div class="section">
    <div class="section-label">Sytuacja</div>
    <div class="section-value">${escapeHtml(record.situation || '—')}</div>
  </div>
  <div class="section">
    <div class="section-label">Emocje przed</div>
    <div class="section-value">${emotionsBefore}</div>
  </div>
  <div class="three-col">
    <div class="col">
      <div class="col-label">Myśl automatyczna</div>
      <div class="col-value">${escapeHtml(record.automaticThoughts || '—')}</div>
    </div>
    <div class="col">
      <div class="col-label">Dowody potwierdzające</div>
      <div class="col-value">${escapeHtml(record.evidenceFor || '—')}</div>
    </div>
    <div class="col">
      <div class="col-label">Dowody przeczące</div>
      <div class="col-value">${escapeHtml(record.evidenceAgainst || '—')}</div>
    </div>
  </div>
  <div class="section">
    <div class="section-label">Myśli alternatywne</div>
    <div class="section-value">${escapeHtml(record.alternativeThought || '—')}</div>
  </div>
  <div class="section">
    <div class="section-label">Emocje po</div>
    <div class="section-value" style="border-bottom:none">${emotionsAfter}</div>
  </div>
</div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missing: { color: colors.textMuted, fontStyle: 'italic' },
  scroll: { padding: 16, paddingBottom: 40 },

  form: { backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  formTitle: { fontSize: 14, color: colors.text, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center', padding: 16, paddingBottom: 12 },
  accentLine: { height: 1, backgroundColor: colors.accent, marginHorizontal: 0, marginBottom: 0 },

  section: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionLast: { borderBottomWidth: 0 },
  sectionLabel: { fontSize: 9, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontWeight: '600' },
  fieldText: { fontSize: 13, color: colors.text, lineHeight: 20 },

  threeCol: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  col: { flex: 1, padding: 12, minHeight: 100 },
  colLeft: { borderRightWidth: 1, borderRightColor: colors.border },
  colMid: { borderRightWidth: 1, borderRightColor: colors.border },
  colRight: {},
  colLabel: { fontSize: 9, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: '600' },
  colText: { fontSize: 12, color: colors.text, lineHeight: 18 },

  exportRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  exportBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  exportBtnText: { fontSize: 14, color: colors.textMuted },
});
```

- [ ] **Sprawdź TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "RecordFormScreen" | head -10
```

Oczekiwane: 0 błędów związanych z tym plikiem.

- [ ] **Commit**

```bash
git add src/tools/thought-record/screens/RecordFormScreen.tsx
git commit -m "feat(tr): add RecordFormScreen with PDF and PNG export"
```

---

## Task 3: Nowy route

**Files:**
- Create: `src/app/(tools)/thought-record/[id]/form.tsx`

- [ ] **Stwórz route**

```typescript
// src/app/(tools)/thought-record/[id]/form.tsx
import { useLocalSearchParams } from 'expo-router';
import { RecordFormScreen } from '../../../../tools/thought-record/screens/RecordFormScreen';

export default function FormRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecordFormScreen id={id} />;
}
```

- [ ] **Commit**

```bash
git add "src/app/(tools)/thought-record/[id]/form.tsx"
git commit -m "feat(tr): add route for paper form screen"
```

---

## Task 4: Przycisk w RecordDetailScreen

**Files:**
- Modify: `src/tools/thought-record/screens/RecordDetailScreen.tsx`

- [ ] **Dodaj przycisk "Formularz" obok "Porównaj" w `metaRow`**

Znajdź w `RecordDetailScreen.tsx` fragment z `actionBtn` (przycisk "Porównaj") i dodaj obok niego drugi przycisk:

```typescript
// Zamień blok metaRow (od <View style={styles.metaRow}> do końca bloku)
<View style={styles.metaRow}>
  <View style={styles.metaLeft}>
    <Text style={styles.headerDate}>{formattedDate}</Text>
    {record.isComplete
      ? <View style={[styles.badge, styles.badgeComplete]}><Text style={[styles.badgeText, { color: colors.success }]}>Kompletny</Text></View>
      : <View style={[styles.badge, styles.badgeInProgress]}><Text style={[styles.badgeText, { color: colors.inProgress }]}>W toku</Text></View>
    }
  </View>
  <View style={styles.metaActions}>
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={() => router.push(`/(tools)/thought-record/${id}/compare`)}
    >
      <Text style={styles.actionBtnText}>⊞ {pl.compare.btnLabel}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={() => router.push(`/(tools)/thought-record/${id}/form`)}
    >
      <Text style={styles.actionBtnText}>◻ {pl.form.btn}</Text>
    </TouchableOpacity>
  </View>
</View>
```

Dodaj `metaActions` do StyleSheet (obok `metaLeft`):

```typescript
metaActions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' },
```

- [ ] **Sprawdź TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Oczekiwane: 0 błędów.

- [ ] **Commit**

```bash
git add src/tools/thought-record/screens/RecordDetailScreen.tsx
git commit -m "feat(tr): add Formularz button in RecordDetailScreen"
```

---

## Task 5: Pełna weryfikacja i PR

- [ ] **Uruchom testy thought-record**

```bash
npx jest --testPathPattern="thought-record" 2>&1 | tail -10
```

Oczekiwane: wszystkie testy zielone.

- [ ] **Pełny test suite**

```bash
npx jest 2>&1 | tail -10
```

Oczekiwane: ≥ 106 testów, wszystkie zielone.

- [ ] **TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Oczekiwane: 0 błędów.

- [ ] **ESLint**

```bash
npx eslint src/tools/thought-record/ --max-warnings=0 2>&1 | tail -10
```

Oczekiwane: 0 warnings.

- [ ] **Push i PR**

```bash
git push -u origin feat/tr-form-export
gh pr create --title "feat: add Thought Record paper form view + PDF/PNG export" --body "$(cat <<'EOF'
## Summary
- New RecordFormScreen: paper form layout matching classic CBT worksheet
- Form sections: situation, emotions before, 3-col (thought/evidence for/against), alternative thought, emotions after
- Export PDF via expo-print (white HTML template, accent color #C4956A for labels)
- Export PNG via react-native-view-shot (captures in-app dark form view)
- New route: thought-record/[id]/form
- RecordDetailScreen: added "Formularz" button next to "Porównaj"

## Test plan
- [ ] All tests pass (≥ 106)
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Manual: open record → tap "Formularz" → form view renders correctly
- [ ] Manual: tap "Eksportuj PDF" → share sheet opens with PDF
- [ ] Manual: tap "Eksportuj PNG" → share sheet opens with PNG
EOF
)"
```
