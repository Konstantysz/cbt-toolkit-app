/* eslint-disable */
// Phase 2 transform: Fix StyleSheet references by keeping colors import for statics
// and using useColors() for dynamic (JSX) rendering
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

// Strategy:
// 1. Keep `colors` import for StyleSheet.create() usage
// 2. Add `useColors` import for JSX dynamic usage
// 3. Add `const colors = useColors()` in component to shadow module-level colors in JSX
// This way StyleSheet still compiles, and JSX gets dynamic colors

// Re-add colors import alongside useColors where needed
const files = [
  BASE + '/tools/thought-record/screens/RecordListScreen.tsx',
  BASE + '/tools/thought-record/screens/RecordDetailScreen.tsx',
  BASE + '/tools/thought-record/screens/RecordFormScreen.tsx',
  BASE + '/tools/thought-record/screens/CompareScreen.tsx',
  BASE + '/tools/thought-record/screens/NewRecordFlow.tsx',
  BASE + '/tools/behavioral-experiment/screens/ExperimentListScreen.tsx',
  BASE + '/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx',
  BASE + '/tools/behavioral-experiment/screens/NewExperimentFlow.tsx',
  BASE + '/tools/abc-model/screens/AbcListScreen.tsx',
  BASE + '/tools/abc-model/screens/AbcDetailScreen.tsx',
  BASE + '/tools/abc-model/screens/NewAbcFlow.tsx',
  BASE + '/core/components/EmotionPicker.tsx',
  BASE + '/core/components/IntensitySlider.tsx',
  BASE + '/core/components/SearchBar.tsx',
  BASE + '/core/components/StepProgress.tsx',
  BASE + '/core/components/StepHelper.tsx',
  BASE + '/tools/thought-record/components/TextStep.tsx',
];

files.forEach((p) => {
  rw(p, (c) => {
    // If file imports useColors but NOT colors (from theme), add colors import back
    // for StyleSheet compatibility
    const hasUseColors = c.includes("import { useColors }");
    const hasColorsFromTheme = /import \{[^}]*\bcolors\b[^}]*\} from '.*theme'/.test(c);

    if (hasUseColors && !hasColorsFromTheme) {
      // Add colors to the token imports line
      if (c.includes("import { spacing, radius, typography } from")) {
        c = c.replace(
          "import { spacing, radius, typography } from",
          "import { colors, spacing, radius, typography } from"
        );
      } else if (c.includes("import { iconRow, spacing, radius, typography } from")) {
        c = c.replace(
          "import { iconRow, spacing, radius, typography } from",
          "import { colors, iconRow, spacing, radius, typography } from"
        );
      } else if (c.includes("import { spacing, typography } from")) {
        c = c.replace(
          "import { spacing, typography } from",
          "import { colors, spacing, typography } from"
        );
      } else if (c.includes("import { radius, typography } from")) {
        c = c.replace(
          "import { radius, typography } from",
          "import { colors, radius, typography } from"
        );
      } else if (c.includes("import { spacing } from")) {
        c = c.replace(
          "import { spacing } from",
          "import { colors, spacing } from"
        );
      } else if (c.includes("import { iconRow, spacing } from")) {
        c = c.replace(
          "import { iconRow, spacing } from",
          "import { colors, iconRow, spacing } from"
        );
      }
    }

    return c;
  });
});

console.log('\nPhase 2 complete - colors re-added to imports');
