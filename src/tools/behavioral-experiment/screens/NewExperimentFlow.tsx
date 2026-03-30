import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { useColors } from '../../../core/theme/useColors';
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
  plan: string;
  predictedOutcome: string;
  potentialProblems: string;
  problemStrategies: string;
}

interface ResultState {
  executionDate: string;
  showDatePicker: boolean;
  actualOutcome: string;
  confirmationPercent: number;
  beliefStrengthAfter: number;
  conclusion: string;
}

type Styles = ReturnType<typeof useStyles>;

const PLAN_STEPS = 5;
const RESULT_STEPS = 3;

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

function useStyles() {
  const colors = useColors();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    stepTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      lineHeight: 28,
    },
    fieldLabel: {
      fontSize: 12,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 15,
      fontSize: 15,
      color: colors.text,
      lineHeight: 24,
      minHeight: 100,
    },
    inputTop: { marginTop: 12 },
    datePicker: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 4,
    },
    datePickerText: { fontSize: 15, color: colors.text },
    navRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bg,
    },
    btnBack: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    btnBackText: { fontSize: 15, color: colors.textMuted, fontWeight: '500' },
    btnNext: {
      flex: 2,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    btnFinish: { backgroundColor: colors.success },
    btnDisabled: { backgroundColor: colors.border },
    btnNextText: { fontSize: 15, color: colors.bg, fontWeight: '600' },
    btnDisabledText: { color: colors.textDim },
    placeholderColor: { color: colors.textDim },
    accentColor: { color: colors.accent },
  });
}

export function NewExperimentFlow({ phase, experimentId }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const [expId, setExpId] = useState<string | null>(experimentId ?? null);
  const [loading, setLoading] = useState(phase === 'result');
  const styles = useStyles();
  const [currentStep, setCurrentStep] = useState(1);

  const [planState, setPlanState] = useState<PlanState>({
    belief: '',
    beliefStrengthBefore: 50,
    plan: '',
    predictedOutcome: '',
    potentialProblems: '',
    problemStrategies: '',
  });

  const [resultState, setResultState] = useState<ResultState>({
    executionDate: todayIso(),
    showDatePicker: false,
    actualOutcome: '',
    confirmationPercent: 50,
    beliefStrengthAfter: 50,
    conclusion: '',
  });

  useEffect(() => {
    if (phase !== 'result' || !experimentId) return;
    (async () => {
      const exp = await repo.getExperimentById(db, experimentId);
      if (exp) {
        setExpId(exp.id);
        setResultState((prev) => ({
          ...prev,
          executionDate: exp.executionDate ?? todayIso(),
          actualOutcome: exp.actualOutcome ?? '',
          confirmationPercent: exp.confirmationPercent ?? 50,
          beliefStrengthAfter: exp.beliefStrengthAfter ?? exp.beliefStrengthBefore,
          conclusion: exp.conclusion ?? '',
        }));
      }
      setLoading(false);
    })();
  }, [db, phase, experimentId]);

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
      if (currentStep === 2) return planState.plan.trim().length > 0;
      if (currentStep === 3) return planState.predictedOutcome.trim().length > 0;
      return true;
    } else {
      if (currentStep === 1) return resultState.actualOutcome.trim().length > 0;
      if (currentStep === 3) return resultState.conclusion.trim().length > 0;
      return true;
    }
  }, [phase, currentStep, planState, resultState]);

  const saveCurrentStep = useCallback(async () => {
    if (!expId) return;
    const stepNumber = phase === 'plan' ? currentStep : currentStep + 5;

    if (phase === 'plan') {
      const updates: Parameters<typeof repo.updateExperiment>[2] = { currentStep: stepNumber };
      if (currentStep === 1) {
        updates.belief = planState.belief;
        updates.beliefStrengthBefore = planState.beliefStrengthBefore;
      }
      if (currentStep === 2) {
        updates.plan = planState.plan;
      }
      if (currentStep === 3) {
        updates.predictedOutcome = planState.predictedOutcome;
      }
      if (currentStep === 4) {
        updates.potentialProblems = planState.potentialProblems;
      }
      if (currentStep === 5) {
        updates.problemStrategies = planState.problemStrategies;
        updates.status = 'planned';
      }
      await repo.updateExperiment(db, expId, updates);
    } else {
      const updates: Parameters<typeof repo.updateExperiment>[2] = { currentStep: stepNumber };
      if (currentStep === 1) {
        updates.executionDate = resultState.executionDate;
        updates.actualOutcome = resultState.actualOutcome;
      }
      if (currentStep === 2) {
        updates.confirmationPercent = resultState.confirmationPercent;
        updates.beliefStrengthAfter = resultState.beliefStrengthAfter;
      }
      if (currentStep === 3) {
        updates.conclusion = resultState.conclusion;
        updates.status = 'completed';
        updates.isComplete = true;
      }
      await repo.updateExperiment(db, expId, updates);
    }
  }, [db, expId, phase, currentStep, planState, resultState]);

  const handleNext = useCallback(async () => {
    await saveCurrentStep();
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
    } else {
      router.replace('/(tools)/behavioral-experiment');
    }
  }, [saveCurrentStep, currentStep, totalSteps]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      router.back();
    }
  }, [currentStep]);

  const updatePlan = useCallback(<K extends keyof PlanState>(key: K, value: PlanState[K]) => {
    setPlanState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateResult = useCallback(<K extends keyof ResultState>(key: K, value: ResultState[K]) => {
    setResultState((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={styles.accentColor.color} />
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
        {phase === 'plan' && renderPlanStep(currentStep, planState, updatePlan, styles)}
        {phase === 'result' && renderResultStep(currentStep, resultState, updateResult, styles)}
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
  styles: Styles
): React.ReactNode {
  if (step === 1)
    return (
      <View>
        <Text style={styles.stepTitle}>{pl.step1.title}</Text>
        <TextInput
          style={styles.input}
          value={state.belief}
          onChangeText={(v) => update('belief', v)}
          placeholder={pl.step1.placeholder}
          placeholderTextColor={styles.placeholderColor.color}
          multiline
          textAlignVertical="top"
        />
        <StepHelper hint={pl.step1.hint} />
        <IntensitySlider
          label={pl.step1.sliderLabel}
          value={state.beliefStrengthBefore}
          onChange={(v) => update('beliefStrengthBefore', v)}
        />
      </View>
    );
  if (step === 2)
    return (
      <View>
        <Text style={styles.stepTitle}>{pl.step2.title}</Text>
        <TextInput
          style={styles.input}
          value={state.plan}
          onChangeText={(v) => update('plan', v)}
          placeholder={pl.step2.placeholder}
          placeholderTextColor={styles.placeholderColor.color}
          multiline
          textAlignVertical="top"
        />
        <StepHelper hint={pl.step2.hint} />
      </View>
    );
  if (step === 3)
    return (
      <View>
        <Text style={styles.stepTitle}>{pl.step3.title}</Text>
        <TextInput
          style={styles.input}
          value={state.predictedOutcome}
          onChangeText={(v) => update('predictedOutcome', v)}
          placeholder={pl.step3.placeholder}
          placeholderTextColor={styles.placeholderColor.color}
          multiline
          textAlignVertical="top"
        />
        <StepHelper hint={pl.step3.hint} />
      </View>
    );
  if (step === 4)
    return (
      <View>
        <Text style={styles.stepTitle}>{pl.step4.title}</Text>
        <TextInput
          style={styles.input}
          value={state.potentialProblems}
          onChangeText={(v) => update('potentialProblems', v)}
          placeholder={pl.step4.placeholder}
          placeholderTextColor={styles.placeholderColor.color}
          multiline
          textAlignVertical="top"
        />
        <StepHelper hint={pl.step4.hint} />
      </View>
    );
  return (
    <View>
      <Text style={styles.stepTitle}>{pl.step5.title}</Text>
      <TextInput
        style={styles.input}
        value={state.problemStrategies}
        onChangeText={(v) => update('problemStrategies', v)}
        placeholder={pl.step5.placeholder}
        placeholderTextColor={styles.placeholderColor.color}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step5.hint} />
    </View>
  );
}

function renderResultStep(
  step: number,
  state: ResultState,
  update: <K extends keyof ResultState>(key: K, value: ResultState[K]) => void,
  styles: Styles
): React.ReactNode {
  if (step === 1) {
    const dateObj = parseISO(state.executionDate);
    return (
      <View>
        <Text style={styles.stepTitle}>{pl.step6.title}</Text>
        <Text style={styles.fieldLabel}>{pl.step6.dateLabel}</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => update('showDatePicker', true)}
          activeOpacity={0.8}
        >
          <Text style={styles.datePickerText}>
            {format(dateObj, 'd MMMM yyyy', { locale: dateFnsPl })}
          </Text>
        </TouchableOpacity>
        {state.showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(_evt, selected) => {
              update('showDatePicker', false);
              if (selected) update('executionDate', selected.toISOString().split('T')[0]);
            }}
          />
        )}
        <TextInput
          style={[styles.input, styles.inputTop]}
          value={state.actualOutcome}
          onChangeText={(v) => update('actualOutcome', v)}
          placeholder={pl.step6.placeholder}
          placeholderTextColor={styles.placeholderColor.color}
          multiline
          textAlignVertical="top"
        />
        <StepHelper hint={pl.step6.hint} />
      </View>
    );
  }
  if (step === 2)
    return (
      <View>
        <Text style={styles.stepTitle}>{pl.step7.title}</Text>
        <StepHelper hint={pl.step7.hint} />
        <IntensitySlider
          label={pl.step7.confirmationLabel}
          value={state.confirmationPercent}
          onChange={(v) => update('confirmationPercent', v)}
        />
        <IntensitySlider
          label={pl.step7.beliefAfterLabel}
          value={state.beliefStrengthAfter}
          onChange={(v) => update('beliefStrengthAfter', v)}
        />
      </View>
    );
  return (
    <View>
      <Text style={styles.stepTitle}>{pl.step8.title}</Text>
      <TextInput
        style={styles.input}
        value={state.conclusion}
        onChangeText={(v) => update('conclusion', v)}
        placeholder={pl.step8.placeholder}
        placeholderTextColor={styles.placeholderColor.color}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step8.hint} />
    </View>
  );
}
