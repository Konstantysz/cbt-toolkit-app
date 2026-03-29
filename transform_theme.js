
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

// Generic transform for screen files: replace colors import with useColors + token imports
function fixImports(c, relPath) {
  // Replace 'import { colors }' or 'import { colors, X }' 
  c = c.replace(
    /import { colors } from '([^']+)';
/,
    (m, path) => "import { useColors } from '" + path + "/useColors';
import { spacing, radius, typography } from '" + path + "';
"
  );
  c = c.replace(
    /import { colors, iconRow } from '([^']+)';
/,
    (m, path) => "import { useColors } from '" + path + "/useColors';
import { iconRow, spacing, radius, typography } from '" + path + "';
"
  );
  return c;
}

// For each file, replace StyleSheet refs to colors.X with nothing (will add inline)
// and remove colors.X from StyleSheet.create() sections
function stripColorsFromStyleSheet(c) {
  // Replace common patterns in StyleSheet
  c = c.replace(/backgroundColor: colors.(w+),/g, '');
  c = c.replace(/borderColor: colors.(w+),/g, '');
  c = c.replace(/color: colors.(w+),/g, '');
  c = c.replace(/shadowColor: colors.(w+),/g, '');
  return c;
}

// Simple approach: fix imports and add useColors() call in each exported component
// Then handle StyleSheet by adding inline styles

// For files with simple structure (no sub-components using colors):
const simpleFiles = [
  {
    path: BASE+'/tools/thought-record/screens/CompareScreen.tsx',
    oldImport: "import { colors } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { spacing, radius, typography } from '../../../core/theme';",
    hookAfter: 'const { record, loading } = useThoughtRecord(db, id);',
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/thought-record/screens/RecordFormScreen.tsx',
    oldImport: "import { colors } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { spacing, radius, typography } from '../../../core/theme';",
    hookAfter: "const { record, loading } = useThoughtRecord(db, id);",
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/thought-record/screens/NewRecordFlow.tsx',
    oldImport: "import { colors, iconRow } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookAfter: 'const [editLoading, setEditLoading] = useState(existingId !== undefined);',
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/behavioral-experiment/screens/ExperimentListScreen.tsx',
    oldImport: "import { colors } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { spacing, radius, typography } from '../../../core/theme';",
    hookAfter: 'const { experiments, loading, refresh } = useBehavioralExperiments(db);',
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx',
    oldImport: "import { colors, iconRow } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookAfter: 'const { experiment, loading } = useBehavioralExperiment(db, id);',
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/behavioral-experiment/screens/NewExperimentFlow.tsx',
    oldImport: "import { colors } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { spacing, radius, typography } from '../../../core/theme';",
    hookAfter: 'const [loading, setLoading] = useState(phase === 'result');',
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/abc-model/screens/AbcListScreen.tsx',
    oldImport: "import { colors } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { spacing, radius, typography } from '../../../core/theme';",
    hookAfter: 'const { entries, loading, refresh } = useAbcEntries(db);',
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/abc-model/screens/AbcDetailScreen.tsx',
    oldImport: "import { colors, iconRow } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookAfter: 'const { entry, loading } = useAbcEntry(db, id);',
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/abc-model/screens/NewAbcFlow.tsx',
    oldImport: "import { colors, iconRow } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookAfter: "const [saving, setSaving] = useState(false);",
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/thought-record/screens/RecordListScreen.tsx',
    oldImport: "import { colors } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { spacing, radius, typography } from '../../../core/theme';",
    hookAfter: 'const { records, loading, refresh } = useThoughtRecords(db);',
    hookLine: '  const colors = useColors();'
  },
  {
    path: BASE+'/tools/thought-record/screens/RecordDetailScreen.tsx',
    oldImport: "import { colors, iconRow } from '../../../core/theme';",
    newImport: "import { useColors } from '../../../core/theme/useColors';
import { iconRow, spacing, radius, typography } from '../../../core/theme';",
    hookAfter: 'const { record, loading } = useThoughtRecord(db, id);',
    hookLine: '  const colors = useColors();'
  },
];

simpleFiles.forEach(({ path, oldImport, newImport, hookAfter, hookLine }) => {
  rw(path, c => {
    if (c.includes(oldImport)) {
      c = c.replace(oldImport, newImport);
    }
    if (c.includes(hookAfter) && !c.includes('const colors = useColors()')) {
      c = c.replace(hookAfter, hookAfter + '
' + hookLine);
    }
    return c;
  });
});

console.log('Done phase 1 - imports and hooks');
