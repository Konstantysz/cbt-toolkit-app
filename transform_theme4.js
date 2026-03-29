/* eslint-disable */
// Phase 3: Add useColors() to main components and sub-components that were missed
const fs = require('fs');
const BASE = 'F:/cbt-toolkit/cbt-toolkit-app/src';

function rw(p, fn) {
  let c = fs.readFileSync(p, 'utf8');
  const nc = fn(c);
  if (nc !== c) {
    fs.writeFileSync(p, nc, 'utf8');
    console.log('CHANGED:', p.split('/').pop());
  } else {
    console.log('SAME:', p.split('/').pop());
  }
}

function addHookAfter(c, trigger, hookLine) {
  if (c.includes(hookLine)) return c; // already there
  const idx = c.indexOf(trigger);
  if (idx === -1) return c;
  return c.slice(0, idx + trigger.length) + hookLine + c.slice(idx + trigger.length);
}

// Add useColors() to main exported components (where the hookTrigger was not found before)
const fixes = [
  // RecordDetailScreen main component
  {
    path: BASE + '/tools/thought-record/screens/RecordDetailScreen.tsx',
    trigger: 'export function RecordDetailScreen({ id }: Props): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // RecordDetailScreen EmotionRow
  {
    path: BASE + '/tools/thought-record/screens/RecordDetailScreen.tsx',
    trigger: 'function EmotionRow({ emotion }: { emotion: Emotion }) {\n  const before = emotion.intensityBefore;',
    hookLine: '\n  const colors = useColors();',
  },
  // RecordDetailScreen IntensityBar
  {
    path: BASE + '/tools/thought-record/screens/RecordDetailScreen.tsx',
    trigger: "}) {\n  return (\n    <View style={styles.ibarRow}>",
    hookLine: '\n  const colors = useColors();',
  },
  // RecordFormScreen FormSection sub-component
  {
    path: BASE + '/tools/thought-record/screens/RecordFormScreen.tsx',
    trigger: "function FormSection({\n  label,\n  children,\n  last,\n}: {\n  label: string;\n  children: React.ReactNode;\n  last?: boolean;\n}) {\n  return (",
    hookLine: '\n  const colors = useColors();',
  },
  // CompareScreen main component
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: 'export function CompareScreen({ id }: CompareScreenProps): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // CompareScreen ColPanel
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function ColPanel({ title, children }: { title: string; children: React.ReactNode }) {\n  return (",
    hookLine: '\n  const colors = useColors();',
  },
  // CompareScreen ColText
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function ColText({ text }: { text: string }) {\n  return <Text",
    hookLine: '\n  const colors = useColors();',
  },
  // CompareScreen CompactEmotionBars
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function CompactEmotionBars({ emotions }: { emotions: Emotion[] }) {\n  return (",
    hookLine: '\n  const colors = useColors();',
  },
  // CompareScreen LeftColumn
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function LeftColumn({ page, record }: { page: number; record: RecordType }) {\n  switch",
    hookLine: '\n  const colors = useColors();',
  },
  // CompareScreen RightColumn
  {
    path: BASE + '/tools/thought-record/screens/CompareScreen.tsx',
    trigger: "function RightColumn({ page, record }: { page: number; record: RecordType }) {\n  switch",
    hookLine: '\n  const colors = useColors();',
  },
  // NewRecordFlow main component
  {
    path: BASE + '/tools/thought-record/screens/NewRecordFlow.tsx',
    trigger: 'export function NewRecordFlow({ existingId }: NewRecordFlowProps): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // RecordListScreen main component
  {
    path: BASE + '/tools/thought-record/screens/RecordListScreen.tsx',
    trigger: 'export function RecordListScreen(): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // ExperimentListScreen main component
  {
    path: BASE + '/tools/behavioral-experiment/screens/ExperimentListScreen.tsx',
    trigger: 'export function ExperimentListScreen(): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // ExperimentDetailScreen main + DetailRow sub-component
  {
    path: BASE + '/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx',
    trigger: 'export function ExperimentDetailScreen({ id }: Props): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // NewExperimentFlow main component
  {
    path: BASE + '/tools/behavioral-experiment/screens/NewExperimentFlow.tsx',
    trigger: 'export function NewExperimentFlow({ phase, experimentId }: Props): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // AbcListScreen main component
  {
    path: BASE + '/tools/abc-model/screens/AbcListScreen.tsx',
    trigger: 'export function AbcListScreen(): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // AbcDetailScreen main component
  {
    path: BASE + '/tools/abc-model/screens/AbcDetailScreen.tsx',
    trigger: 'export function AbcDetailScreen({ id }: Props): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // NewAbcFlow main component
  {
    path: BASE + '/tools/abc-model/screens/NewAbcFlow.tsx',
    trigger: 'export function NewAbcFlow({ existingId }: Props): React.JSX.Element {\n  const db = useSQLiteContext();',
    hookLine: '\n  const colors = useColors();',
  },
  // Step1 sub-component in NewAbcFlow
  {
    path: BASE + '/tools/abc-model/screens/NewAbcFlow.tsx',
    trigger: '}): React.JSX.Element {\n  return (\n    <View style={styles.stepBody}>',
    hookLine: '\n  const colors = useColors();',
  },
];

fixes.forEach(({ path, trigger, hookLine }) => {
  rw(path, (c) => addHookAfter(c, trigger, hookLine));
});

// EmotionPicker - ensure useColors() is in the component
rw(BASE + '/core/components/EmotionPicker.tsx', (c) => {
  return addHookAfter(
    c,
    "export function EmotionPicker({ selected, onChange }: Props) {\n  const selectedNames",
    '\n  const colors = useColors();'
  );
});

// IntensitySlider - ensure useColors() is in the component
rw(BASE + '/core/components/IntensitySlider.tsx', (c) => {
  return addHookAfter(
    c,
    "export function IntensitySlider({ value, onChange, label, readOnly }: Props) {\n  return (",
    '\n  const colors = useColors();'
  );
});

// SearchBar - ensure useColors() is in the component
rw(BASE + '/core/components/SearchBar.tsx', (c) => {
  return addHookAfter(
    c,
    "}): React.JSX.Element {\n  return (",
    '\n  const colors = useColors();'
  );
});

// StepProgress - ensure useColors() is in the component
rw(BASE + '/core/components/StepProgress.tsx', (c) => {
  return addHookAfter(
    c,
    "export function StepProgress({ totalSteps, currentStep }: Props) {\n  return (",
    '\n  const colors = useColors();'
  );
});

// StepHelper - ensure useColors() is in the component
rw(BASE + '/core/components/StepHelper.tsx', (c) => {
  return addHookAfter(
    c,
    "}): React.JSX.Element {\n  const [open, setOpen] = useState(false);\n\n  return (",
    '\n  const colors = useColors();'
  );
});

// TextStep
rw(BASE + '/tools/thought-record/components/TextStep.tsx', (c) => {
  return addHookAfter(
    c,
    "export function TextStep({ prompt, value, onChange, placeholder, minHeight = 130 }: Props) {\n  return (",
    '\n  const colors = useColors();'
  );
});

console.log('\nPhase 3 complete');
