import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { colors } from '../../../core/theme';
import { StepProgress } from '../../../core/components/StepProgress';
import { StepHelper } from '../../../core/components/StepHelper';
import { IntensitySlider } from '../../../core/components/IntensitySlider';
import { pl } from '../i18n/pl';
import * as repo from '../repository';

interface Props {
  phase: 'plan' | 'result';
  experimentId?: string;
}

interface PlanState {
  belief: string;
  beliefStrengthBefore: number;
  alternativeBelief: string;
  plan: string;
  predictedOutcome: string;
}

interface ResultState {
  executionDate: string;
  executionNotes: string;
  actualOutcome: string;
  conclusion: string;
  beliefStrengthAfter: number;
}

const PLAN_STEPS = 4;
const RESULT_STEPS = 3;

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

export function NewExperimentFlow({ phase, experimentId }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const [expId, setExpId] = useState<string | null>(experimentId ?? null);
  const [loading, setLoading] = useState(phase === 'result');
  const [currentStep, setCurrentStep] = useState(1);

  const [planState, setPlanState] = useState<PlanState>({
    belief: '',
    beliefStrengthBefore: 50,
    alternativeBelief: '',
    plan: '',
    predictedOutcome: '',
  });

  const [resultState, setResultState] = useState<ResultState>({
    executionDate: todayIso(),
    executionNotes: '',
    actualOutcome: '',
    conclusion: '',
    beliefStrengthAfter: 50,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load existing experiment (phase=result)
  useEffect(() => {
    if (phase !== 'result' || !experimentId) return;
    (async () => {
      const exp = await repo.getExperimentById(db, experimentId);
      if (exp) {
        setExpId(exp.id);
        setResultState(prev => ({
          ...prev,
          executionDate: exp.executionDate ?? todayIso(),
          executionNotes: exp.executionNotes ?? '',
          actualOutcome: exp.actualOutcome ?? '',
          conclusion: exp.conclusion ?? '',
          beliefStrengthAfter: exp.beliefStrengthAfter ?? prev.beliefStrengthAfter,
        }));
      }
      setLoading(false);
    })();
  }, [db, phase, experimentId]);

  // Create new experiment record on mount (phase=plan)
  useEffect(() => {
    if (phase !== 'plan') return;
    (async () => {
      const exp = await repo.createExperiment(db);
      setExpId(exp.id);
    })();
  }, [db, phase]);

  const totalSteps = phase === 'plan' ? PLAN_STEPS : RESULT_STEPS;

  const isNextEnabled = useCallback((): boolean => {
    if (phase === 'plan') {
      if (currentStep === 1) return planState.belief.trim().length > 0;
      if (currentStep === 3) return planState.plan.trim().length > 0;
      return true;
    } else {
      if (currentStep === 1) return resultState.executionDate.trim().length > 0;
      if (currentStep === 3) return resultState.conclusion.trim().length > 0;
      return true;
    }
  }, [phase, currentStep, planState, resultState]);

  const saveCurrentStep = useCallback(async () => {
    if (!expId) return;
    const stepNumber = phase === 'plan' ? currentStep : currentStep + 4;

    if (phase === 'plan') {
      const updates: Parameters<typeof repo.updateExperiment>[2] = { currentStep: stepNumber };
      if (currentStep === 1) { updates.belief = planState.belief; updates.beliefStrengthBefore = planState.beliefStrengthBefore; }
      if (currentStep === 2) { updates.alternativeBelief = planState.alternativeBelief; }
      if (currentStep === 3) { updates.plan = planState.plan; }
      if (currentStep === 4) { updates.predictedOutcome = planState.predictedOutcome; updates.status = 'planned'; }
      await repo.updateExperiment(db, expId, updates);
    } else {
      const updates: Parameters<typeof repo.updateExperiment>[2] = { currentStep: stepNumber };
      if (currentStep === 1) { updates.executionDate = resultState.executionDate; updates.executionNotes = resultState.executionNotes; }
      if (currentStep === 2) { updates.actualOutcome = resultState.actualOutcome; }
      if (currentStep === 3) {
        updates.conclusion = resultState.conclusion;
        updates.beliefStrengthAfter = resultState.beliefStrengthAfter;
        updates.status = 'completed';
        updates.isComplete = true;
      }
      await repo.updateExperiment(db, expId, updates);
    }
  }, [db, expId, phase, currentStep, planState, resultState]);

  const handleNext = useCallback(async () => {
    await saveCurrentStep();
    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1);
    } else {
      router.replace('/(tools)/behavioral-experiment');
    }
  }, [saveCurrentStep, currentStep, totalSteps]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    } else {
      router.back();
    }
  }, [currentStep]);

  const updatePlan = useCallback(<K extends keyof PlanState>(key: K, value: PlanState[K]) => {
    setPlanState(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateResult = useCallback(<K extends keyof ResultState>(key: K, value: ResultState[K]) => {
    setResultState(prev => ({ ...prev, [key]: value }));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const isLast = currentStep === totalSteps;
  const nextEnabled = isNextEnabled();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StepProgress totalSteps={totalSteps} currentStep={currentStep} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {phase === 'plan' && renderPlanStep(currentStep, planState, updatePlan, showDatePicker, setShowDatePicker)}
        {phase === 'result' && renderResultStep(currentStep, resultState, updateResult, showDatePicker, setShowDatePicker)}
      </ScrollView>

      <View style={styles.navRow}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.btnBack} onPress={handleBack}>
            <Text style={styles.btnBackText}>{pl.nav.back}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btnNext, !nextEnabled && styles.btnDisabled, isLast && styles.btnFinish]}
          onPress={handleNext}
          disabled={!nextEnabled}
          accessibilityState={{ disabled: !nextEnabled }}
        >
          <Text
            style={[styles.btnNextText, !nextEnabled && styles.btnDisabledText]}
            accessibilityState={{ disabled: !nextEnabled }}
          >
            {isLast ? pl.nav.finish : pl.nav.next}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function renderPlanStep(
  step: number,
  state: PlanState,
  update: <K extends keyof PlanState>(key: K, value: PlanState[K]) => void,
  showDatePicker: boolean,
  setShowDatePicker: (v: boolean) => void,
): React.ReactNode {
  if (step === 1) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step1.title}</Text>
      <TextInput
        style={styles.input}
        value={state.belief}
        onChangeText={v => update('belief', v)}
        placeholder={pl.step1.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step1.hint} />
      <IntensitySlider
        label={pl.step1.sliderLabel}
        value={state.beliefStrengthBefore}
        onChange={v => update('beliefStrengthBefore', v)}
      />
    </View>
  );
  if (step === 2) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step2.title}</Text>
      <TextInput
        style={styles.input}
        value={state.alternativeBelief}
        onChangeText={v => update('alternativeBelief', v)}
        placeholder={pl.step2.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step2.hint} />
    </View>
  );
  if (step === 3) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step3.title}</Text>
      <TextInput
        style={styles.input}
        value={state.plan}
        onChangeText={v => update('plan', v)}
        placeholder={pl.step3.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step3.hint} />
    </View>
  );
  return (
    <View>
      <Text style={styles.stepTitle}>{pl.step4.title}</Text>
      <TextInput
        style={styles.input}
        value={state.predictedOutcome}
        onChangeText={v => update('predictedOutcome', v)}
        placeholder={pl.step4.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step4.hint} />
    </View>
  );
}

function renderResultStep(
  step: number,
  state: ResultState,
  update: <K extends keyof ResultState>(key: K, value: ResultState[K]) => void,
  showDatePicker: boolean,
  setShowDatePicker: (v: boolean) => void,
): React.ReactNode {
  if (step === 1) {
    const date = parseISO(state.executionDate);
    const dateLabel = format(date, 'd MMMM yyyy', { locale: dateFnsPl });
    return (
      <View>
        <Text style={styles.stepTitle}>{pl.step5.title}</Text>
        <TouchableOpacity style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateLabel}>{pl.step5.dateLabel}</Text>
          <Text style={styles.dateValue}>{dateLabel}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            maximumDate={new Date()}
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) update('executionDate', selected.toISOString().split('T')[0]);
            }}
          />
        )}
        <TextInput
          style={[styles.input, { marginTop: 12 }]}
          value={state.executionNotes}
          onChangeText={v => update('executionNotes', v)}
          placeholder={pl.step5.notesPlaceholder}
          placeholderTextColor={colors.textDim}
          multiline
          textAlignVertical="top"
          />
        <StepHelper hint={pl.step5.hint} />
      </View>
    );
  }
  if (step === 2) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step6.title}</Text>
      <TextInput
        style={styles.input}
        value={state.actualOutcome}
        onChangeText={v => update('actualOutcome', v)}
        placeholder={pl.step6.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step6.hint} />
    </View>
  );
  return (
    <View>
      <Text style={styles.stepTitle}>{pl.step7.title}</Text>
      <TextInput
        style={styles.input}
        value={state.conclusion}
        onChangeText={v => update('conclusion', v)}
        placeholder={pl.step7.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step7.hint} />
      <IntensitySlider
        label={pl.step7.sliderLabel}
        value={state.beliefStrengthAfter}
        onChange={v => update('beliefStrengthAfter', v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12, lineHeight: 28 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    padding: 15, fontSize: 15, color: colors.text, lineHeight: 24,
    minHeight: 100,
  },
  navRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  btnBack: {
    flex: 1, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  btnBackText: { fontSize: 15, color: colors.textMuted, fontWeight: '500' },
  btnNext: {
    flex: 2, backgroundColor: colors.accent,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  btnFinish: { backgroundColor: colors.success },
  btnDisabled: { backgroundColor: colors.border },
  btnNextText: { fontSize: 15, color: colors.bg, fontWeight: '600' },
  btnDisabledText: { color: colors.textDim },
  dateRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14,
  },
  dateLabel: { fontSize: 13, color: colors.textMuted },
  dateValue: { fontSize: 14, color: colors.accent, fontWeight: '600' },
});
