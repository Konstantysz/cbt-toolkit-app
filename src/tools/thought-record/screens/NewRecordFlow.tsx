// src/tools/thought-record/screens/NewRecordFlow.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '../../../core/theme';
import { StepProgress } from '../components/StepProgress';
import * as repo from '../repository';
import type { Emotion } from '../types';

const TOTAL_STEPS = 7;

interface FlowState {
  recordId: string | null;
  situation: string;
  situationDate: string;
  emotions: Emotion[];
  automaticThoughts: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  outcome: string;
}

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

export function NewRecordFlow(): React.JSX.Element {
  const db = useSQLiteContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<FlowState>({
    recordId: null,
    situation: '',
    situationDate: todayIso(),
    emotions: [],
    automaticThoughts: '',
    evidenceFor: '',
    evidenceAgainst: '',
    alternativeThought: '',
    outcome: '',
  });
  const [emotionsError, setEmotionsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Create the DB record on mount
  useEffect(() => {
    repo.createRecord(db).then(record => {
      setState(s => ({ ...s, recordId: record.id }));
    });
  }, [db]);

  const update = useCallback(<K extends keyof FlowState>(key: K, value: FlowState[K]) => {
    setState(s => ({ ...s, [key]: value }));
  }, []);

  async function persistCurrentStep(step: number) {
    if (!state.recordId) return;
    setSaving(true);
    try {
      await repo.updateRecord(db, state.recordId, {
        situation: state.situation,
        situationDate: state.situationDate || null,
        emotions: state.emotions,
        automaticThoughts: state.automaticThoughts,
        evidenceFor: state.evidenceFor,
        evidenceAgainst: state.evidenceAgainst,
        alternativeThought: state.alternativeThought,
        outcome: state.outcome || null,
        currentStep: step,
      });
    } finally {
      setSaving(false);
    }
  }

  async function goNext() {
    if (currentStep === 2 && state.emotions.length === 0) {
      setEmotionsError(true);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setEmotionsError(false);

    if (currentStep === TOTAL_STEPS) {
      await persistCurrentStep(TOTAL_STEPS);
      await repo.updateRecord(db, state.recordId!, { isComplete: true });
      router.replace(`/(tools)/thought-record/${state.recordId}`);
      return;
    }

    await persistCurrentStep(currentStep + 1);
    setCurrentStep(s => s + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  async function goBack() {
    if (currentStep === 1) {
      router.back();
      return;
    }
    await persistCurrentStep(currentStep - 1);
    setCurrentStep(s => s - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  if (!state.recordId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StepProgress totalSteps={TOTAL_STEPS} currentStep={currentStep} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep(currentStep, state, update, emotionsError)}
      </ScrollView>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.btnGhost} onPress={goBack}>
          <Text style={styles.btnGhostText}>
            {currentStep === 1 ? 'Anuluj' : '← Wstecz'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnPrimary, currentStep === TOTAL_STEPS && styles.btnSuccess]}
          onPress={goNext}
          disabled={saving}
        >
          <Text style={styles.btnPrimaryText}>
            {saving ? '...' : currentStep === TOTAL_STEPS ? 'Zakończ ✓' : 'Dalej →'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Placeholder — replaced in Task 7
function renderStep(
  step: number,
  state: FlowState,
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void,
  emotionsError: boolean,
): React.ReactNode {
  return <View />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 4 },
  nav: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  btnGhost: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  btnGhostText: { color: colors.textMuted, fontSize: 15 },
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  btnSuccess: { backgroundColor: colors.success },
  btnPrimaryText: { color: colors.bg, fontSize: 15, fontWeight: '600' },
});
