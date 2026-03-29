# Code Review: `fix/accessibility-theme-tokens` vs `origin/develop`

This implementation for "Accessibility Theme Tokens" is an absolute architectural mess. If I saw this in a real PR, I'd reject it purely on the amount of technical debt and performance regressions it introduces to the codebase. Below is a harsh review detailing exactly what you got wrong and why this needs a massive refactor before it sees the light of day.

## Critical Architectural Flaws & Implementation Issues

### 1. The "Frankenstein" of Static and Dynamic Rendering (Variable Shadowing)
**Files Affected:**
- `src/tools/abc-model/screens/AbcListScreen.tsx` (Line 21 vs Line 9)
- `src/tools/behavioral-experiment/screens/ExperimentListScreen.tsx` (Line 15 vs Line 8)
- `src/tools/thought-record/screens/RecordListScreen.tsx` (Line 21 vs Line 9)
- (and all the equivalent `Flow` screens)

**Criticism:**
You are importing the static `colors` object (`import { colors } from '../../../core/theme'`) at the top of the file, and then inside your component render function, you immediately declare `const colors = useColors()`. **You are shadowing the static import!** 

What does this mean? It means your styles inside the component (`<Text style={{ color: colors.inProgress }}>`) are using the *dynamic* hook evaluation, but your `StyleSheet.create` styles outside the component are evaluating against the *static* imported theme. If a user flips their device into high contrast mode, all your inline overrides will flip, but anything defined in `StyleSheet.create` (like your root containers' `backgroundColor: colors.bg`) stays frozen to whatever it was at module load time. Your UI is going to literally break itself into pieces.

Either rename your hook variable to `themeColors` or, better yet, refactor everything to an actual `useThemeStyles()` pattern so you aren't doing this monstrous split-brain styling technique.

### 2. React Native Rendering Performance Killer (Inline Styles)
**Files Affected:**
- `src/tools/thought-record/screens/RecordDetailScreen.tsx` (All over the render function)
- `src/core/components/EmotionPicker.tsx`
- `src/core/components/IntensitySlider.tsx`
- `src/core/components/StepHelper.tsx`

**Criticism:**
Every single time you write `style={[styles.something, { color: colors.textMuted }]}` you are allocating a brand new Javascript style array AND a brand new inline style object on **every single render cycle**. React Native's bridge serialization will absolutely gasp for air when traversing long lists or deeply nested screens like `RecordDetailScreen`. 

You've successfully defeated the entire performance benefit of `StyleSheet`. Do not move static properties into the JSX markup like this inline. Use a library like `react-native-unistyles` or write a custom hook (`useMemoizedStyles(theme)`) to return precomputed StyleSheet objects when the theme state changes. This inline vomit is un-mergable.

### 3. The "Placebo Effect" Hook (Forgot to import it entirely)
**Files Affected:**
- `src/tools/thought-record/screens/RecordDetailScreen.tsx` (Lines 83-240)

**Criticism:**
In `RecordDetailScreen.tsx` you completely gutted the neat static styles and replaced them with inline DYNAMIC styling: `style={[styles.stepNum, { color: colors.textDim }]}`.
However... **you didn't even import or call `useColors()` in this file!** 

This means that `colors.textDim` is literally just resolving to the static import from `../theme/index.ts`. All of these hundreds of arrays and inline style creations you added to this file are literally just referencing the static constant. You tanked the render performance by creating new objects on the JS thread without actually enabling dynamic accessibility features. This file does literally *nothing* to support the feature the PR branch is named after.

### 4. Defeating the Purpose of Design System Tokens
**Files Affected:**
- `src/core/components/StepHelper.tsx` (Line 302, 304)
- `src/core/components/SearchBar.tsx` (Lines 193-195)
- `src/tools/thought-record/components/TextStep.tsx` (Line 482-483)

**Criticism:**
You literally proudly placed "Theme tokens: `typography` scale added" in the changelog, then immediately went around the app writing `fontSize: typography.md - 1`, `marginTop: spacing.md - 4`, and `borderRadius: radius.sm + 2`.

Are you kidding me? A token is meant to be an absolute semantic value. If `typography.md` (16px) is too large, you clearly need a `typography.md_sm` (15px) or whatever your design system dictates. By subtracting 1 from a design token, you have just reinvented magic numbers but disguised them as math equations. I will instantly reject any PR that does basic arithmetic on typography constants. If I see "almost large minus 4" again, we're having a 1-on-1.

### 5. Inconsistent / Sloppy Half-Measures on Theming
**Files Affected:**
- `src/core/components/StepHelper.tsx` (Line 300 - `toggleActive`)
- `src/tools/thought-record/screens/RecordDetailScreen.tsx` (Line 318 - `borderColor: 'rgba(196,96,90,0.22)'`)

**Criticism:**
While you were busy appending `colors.accent` into arrays everywhere, you completely missed the hardcoded `rgba(196,149,106,0.22)` in `StepHelper.tsx` and the hardcoded UI danger borders in `RecordDetailScreen.tsx`. What happens when the app goes into dark mode or high-contrast, and these opacities and hexes remain exactly the same? They're either going to be entirely invisible or burn out the user's retinas. If you're going to theme the active toggle state, you actually have to theme *all* of it.

### 6. Broad-brush Jest Mocks Destroying Integration Behaviors 
**Files Affected:**
- `__mocks__/@react-native-async-storage/async-storage.js`

**Criticism:**
The changelog says "Jest: AsyncStorage global mock added so tests no longer fail". Yeah, because returning `null` globally for `getItem` unconditionally ensures tests pass when they render. But you've also completely masked any functional or integration tests that rely on Async Storage acting like a real mock memory layer. Any onboarding flag (e.g. `abc-model:onboarding-seeded` in `AbcListScreen`) is going to always evaluate to `null` because you blanketed `mockResolvedValue(null)` over the entire suite. Use a memory-backed mock for AsyncStorage (like `@react-native-async-storage/async-storage/jest/async-storage-mock` which tracks state) instead of dummy `jest.fn()` functions.

## Final Verdict
**Status:** **CHANGES REQUESTED**

You need to step away from inline style objects, handle overriding static objects gracefully using a global theme provider wrapper or pre-computed style hooks, stop doing arithmetic on design constants, and fix the files where you didn't even use the hook. Fix these and re-request review.
