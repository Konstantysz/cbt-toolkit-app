/* eslint-disable */
// Auto-generated transform script - delete after use
const fs = require('fs');
const BASE = 'F:/cbt-toolkit/cbt-toolkit-app/src';

function rw(p, fn) {
  let c = fs.readFileSync(p, 'utf8');
  const nc = fn(c);
  if (nc !== c) {
    fs.writeFileSync(p, nc, 'utf8');
    console.log('CHANGED:', p.split('/').pop());
  } else {
    console.log('SAME (check manually):', p.split('/').pop());
  }
}

// Phase 1: Fix imports and add useColors() hook in all screen files
const transforms = [
  {
    path: BASE + '/core/components/EmotionPicker.tsx',
    oldImp: "import { colors } from '../theme';",
    newImp: "import { useColors } from '../theme/useColors';\nimport { spacing, typography } from '../theme';",
    hookTrigger: "export function EmotionPicker({ selected, onChange }: Props) {",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/core/components/IntensitySlider.tsx',
    oldImp: "import { colors } from '../theme';",
    newImp: "import { useColors } from '../theme/useColors';\nimport { spacing, radius, typography } from '../theme';",
    hookTrigger: "export function IntensitySlider({ value, onChange, label, readOnly }: Props) {",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/core/components/SearchBar.tsx',
    oldImp: "import { colors } from '../theme';",
    newImp: "import { useColors } from '../theme/useColors';\nimport { spacing, radius, typography } from '../theme';",
    hookTrigger: "}): React.JSX.Element {",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/core/components/StepProgress.tsx',
    oldImp: "import { colors } from '../theme';",
    newImp: "import { useColors } from '../theme/useColors';\nimport { spacing } from '../theme';",
    hookTrigger: "export function StepProgress({ totalSteps, currentStep }: Props) {",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/core/components/StepHelper.tsx',
    oldImp: "import { colors } from '../theme';",
    newImp: "import { useColors } from '../theme/useColors';\nimport { spacing, radius, typography } from '../theme';",
    hookTrigger: "}): React.JSX.Element {\n  const [open, setOpen] = useState(false);",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/components/TextStep.tsx',
    oldImp: "import { colors } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { radius, typography } from '../../../core/theme';",
    hookTrigger: "export function TextStep({ prompt, value, onChange, placeholder, minHeight = 130 }: Props) {",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/screens/RecordListScreen.tsx',
    oldImp: "import { colors } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { spacing, typography } from '../../../core/theme';",
    hookTrigger: "  const { records, loading, refresh } = useThoughtRecords(db);",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/screens/RecordDetailScreen.tsx',
    oldImp: "import { colors, iconRow } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookTrigger: "  const { record, loading } = useThoughtRecord(db, id);\n\n  const confirmDelete",
    hookInsert: "\n  const colors = useColors();\n",
  },
  {
    path: BASE + '/tools/thought-record/screens/RecordFormScreen.tsx',
    oldImp: "import { colors } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { spacing, radius, typography } from '../../../core/theme';",
    hookTrigger: "  const { record, loading } = useThoughtRecord(db, id);\n  const formRef",
    hookInsert: "\n  const colors = useColors();\n",
  },
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    oldImp: "import { colors } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { spacing, typography } from '../../../core/theme';",
    hookTrigger: "  const { record, loading } = useThoughtRecord(db, id);\n  const [page",
    hookInsert: "\n  const colors = useColors();\n",
  },
  {
    path: BASE + '/tools/thought-record/screens/NewRecordFlow.tsx',
    oldImp: "import { colors, iconRow } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookTrigger: "  const [editLoading, setEditLoading] = useState(existingId !== undefined);",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/behavioral-experiment/screens/ExperimentListScreen.tsx',
    oldImp: "import { colors } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { spacing, typography } from '../../../core/theme';",
    hookTrigger: "  const { experiments, loading, refresh } = useBehavioralExperiments(db);",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx',
    oldImp: "import { colors, iconRow } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookTrigger: "  const { experiment, loading } = useBehavioralExperiment(db, id);\n\n  const confirmDelete",
    hookInsert: "\n  const colors = useColors();\n",
  },
  {
    path: BASE + '/tools/behavioral-experiment/screens/NewExperimentFlow.tsx',
    oldImp: "import { colors } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { spacing, radius, typography } from '../../../core/theme';",
    hookTrigger: "  const [loading, setLoading] = useState(phase === 'result');",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/abc-model/screens/AbcListScreen.tsx',
    oldImp: "import { colors } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { spacing, typography } from '../../../core/theme';",
    hookTrigger: "  const { entries, loading, refresh } = useAbcEntries(db);",
    hookInsert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/abc-model/screens/AbcDetailScreen.tsx',
    oldImp: "import { colors, iconRow } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookTrigger: "  const { entry, loading } = useAbcEntry(db, id);\n\n  const confirmDelete",
    hookInsert: "\n  const colors = useColors();\n",
  },
  {
    path: BASE + '/tools/abc-model/screens/NewAbcFlow.tsx',
    oldImp: "import { colors, iconRow } from '../../../core/theme';",
    newImp: "import { useColors } from '../../../core/theme/useColors';\nimport { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookTrigger: "  const [saving, setSaving] = useState(false);",
    hookInsert: "\n  const colors = useColors();",
  },
];

transforms.forEach(({ path, oldImp, newImp, hookTrigger, hookInsert }) => {
  rw(path, (c) => {
    // Fix import
    if (c.includes(oldImp)) {
      c = c.replace(oldImp, newImp);
    }
    // Add useColors hook if not already present
    if (!c.includes('const colors = useColors()') && c.includes(hookTrigger)) {
      c = c.replace(hookTrigger, hookTrigger + hookInsert);
    }
    return c;
  });
});

// Phase 2: For sub-components that also use colors (EmotionRow, IntensityBar, etc.)
// Add useColors hook to them too
const subComponentFixes = [
  {
    path: BASE + '/tools/thought-record/screens/RecordDetailScreen.tsx',
    trigger: "function EmotionRow({ emotion }: { emotion: Emotion }) {\n  const before",
    insert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/screens/RecordDetailScreen.tsx',
    trigger: "}) {\n  return (\n    <View style={styles.ibarRow}>",
    insert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function ColPanel({ title, children }: { title: string; children: React.ReactNode }) {\n  return (",
    insert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function ColText({ text }: { text: string }) {\n  return",
    insert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function CompactEmotionBars({ emotions }: { emotions: Emotion[] }) {\n  return (",
    insert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function LeftColumn({ page, record }: { page: number; record: RecordType }) {\n  switch",
    insert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function RightColumn({ page, record }: { page: number; record: RecordType }) {\n  switch",
    insert: "\n  const colors = useColors();",
  },
  {
    path: BASE + '/tools/thought-record/screens/RecordFormScreen.tsx',
    trigger: "}): React.JSX.Element {",
    insert: "\n  const colors = useColors();",
  },
];

subComponentFixes.forEach(({ path, trigger, insert }) => {
  rw(path, (c) => {
    // Only add if trigger found and not already added right after
    const idx = c.indexOf(trigger);
    if (idx === -1) return c;
    const after = c.slice(idx + trigger.length, idx + trigger.length + 50);
    if (after.includes('const colors = useColors()')) return c;
    return c.replace(trigger, trigger + insert);
  });
});

console.log('\nPhase 1 & 2 complete - imports and hooks added');
console.log('Note: StyleSheet references to colors still need to be fixed via inline styles');
console.log('Running TypeScript check to see current state...');
