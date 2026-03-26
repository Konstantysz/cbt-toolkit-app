// src/tools/thought-record/screens/NewRecordFlow.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { colors } from '../../../core/theme';
import { StepProgress } from '../../../core/components/StepProgress';
import { TextStep } from '../components/TextStep';
import { EmotionPicker } from '../../../core/components/EmotionPicker';
import { IntensitySlider } from '../../../core/components/IntensitySlider';
import { StepHelper } from '../../../core/components/StepHelper';
import { pl } from '../i18n/pl';
import * as repo from '../repository';
import type { Emotion } from '../types';
import { Ionicons } from '@expo/vector-icons';

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

const stepStyles = StyleSheet.create({
  prompt: { fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 12, fontStyle: 'italic' },
  fieldLabel: { fontSize: 11, color: colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  errorText: { fontSize: 13, color: colors.danger, fontStyle: 'italic', marginBottom: 12 },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  dateLabel: { fontSize: 13, color: colors.textMuted },
  dateValue: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
});

function Step1Situation({
  state,
  update,
}: {
  state: FlowState;
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const date = parseISO(state.situationDate);
  const dateLabel = format(date, 'd MMMM yyyy', { locale: dateFnsPl });

  return (
    <View>
      <TextStep
        prompt={pl.step1.prompt}
        value={state.situation}
        onChange={v => update('situation', v)}
        placeholder="Np. Kłótnia z partnerem o obowiązki domowe..."
        minHeight={150}
      />
      <StepHelper hint={pl.helper.hints.step1} />
      <TouchableOpacity
        style={stepStyles.dateRow}
        onPress={() => setShowPicker(true)}
      >
        <Text style={stepStyles.dateLabel}>{pl.step1.dateLabel}</Text>
        <Text style={stepStyles.dateValue}>{dateLabel}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, selected) => {
            setShowPicker(false);
            if (selected) update('situationDate', selected.toISOString().split('T')[0]);
          }}
        />
      )}
    </View>
  );
}

function Step2Emotions({
  state,
  update,
  error,
}: {
  state: FlowState;
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
  error: boolean;
}) {
  return (
    <View>
      <Text style={stepStyles.prompt}>{pl.step2.prompt}</Text>
      {error && (
        <Text style={stepStyles.errorText}>Wybierz co najmniej jedną emocję, aby kontynuować.</Text>
      )}
      <EmotionPicker
        selected={state.emotions}
        onChange={emotions => update('emotions', emotions)}
      />
      {state.emotions.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={stepStyles.fieldLabel}>{pl.step2.intensityLabel}</Text>
          {state.emotions.map(em => (
            <IntensitySlider
              key={em.name}
              label={em.name}
              value={em.intensityBefore}
              onChange={v =>
                update(
                  'emotions',
                  state.emotions.map(e =>
                    e.name === em.name ? { ...e, intensityBefore: v } : e
                  )
                )
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

function Step7Outcome({
  state,
  update,
}: {
  state: FlowState;
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
}) {
  return (
    <View>
      <Text style={stepStyles.prompt}>{pl.step7.prompt}</Text>
      {state.emotions.map(em => (
        <IntensitySlider
          key={em.name}
          label={em.name}
          value={em.intensityAfter ?? em.intensityBefore}
          onChange={v =>
            update(
              'emotions',
              state.emotions.map(e =>
                e.name === em.name ? { ...e, intensityAfter: v } : e
              )
            )
          }
        />
      ))}
      <View style={{ marginTop: 16 }}>
        <Text style={stepStyles.fieldLabel}>Notatki końcowe (opcjonalne)</Text>
        <TextInput
          style={[stepStyles.input, { minHeight: 90 }]}
          value={state.outcome}
          onChangeText={v => update('outcome', v)}
          placeholder="Dodatkowe przemyślenia..."
          placeholderTextColor={colors.textDim}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}

function renderStep(
  step: number,
  state: FlowState,
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void,
  emotionsError: boolean,
): React.ReactNode {
  switch (step) {
    case 1: return <Step1Situation state={state} update={update} />;
    case 2: return <Step2Emotions state={state} update={update} error={emotionsError} />;
    case 3: return (
      <View>
        <TextStep
          prompt={pl.step3.prompt}
          value={state.automaticThoughts}
          onChange={v => update('automaticThoughts', v)}
          placeholder="Np. Zaraz coś złego się stanie..."
        />
        <StepHelper hint={pl.helper.hints.step3} />
      </View>
    );
    case 4: return (
      <View>
        <TextStep
          prompt={pl.step4.prompt}
          value={state.evidenceFor}
          onChange={v => update('evidenceFor', v)}
          placeholder="Np. Ostatnio popełniłem błąd..."
        />
        <StepHelper hint={pl.helper.hints.step4} />
      </View>
    );
    case 5: return (
      <View>
        <TextStep
          prompt={pl.step5.prompt}
          value={state.evidenceAgainst}
          onChange={v => update('evidenceAgainst', v)}
          placeholder="Np. Przez ostatni rok radziłem sobie dobrze..."
        />
        <StepHelper hint={pl.helper.hints.step5} />
      </View>
    );
    case 6: return (
      <View>
        <TextStep
          prompt={pl.step6.prompt}
          value={state.alternativeThought}
          onChange={v => update('alternativeThought', v)}
          placeholder="Np. Chociaż czuję niepokój, mam wiele dowodów..."
        />
        <StepHelper hint={pl.helper.hints.step6} />
      </View>
    );
    case 7: return <Step7Outcome state={state} update={update} />;
    default: return null;
  }
}

interface NewRecordFlowProps {
  existingId?: string;
}

export function NewRecordFlow({ existingId }: NewRecordFlowProps): React.JSX.Element {
  const db = useSQLiteContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [editLoading, setEditLoading] = useState(existingId !== undefined);
  const [state, setState] = useState<FlowState>({
    recordId: existingId ?? null,
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

  // Create the DB record on mount (new record only)
  useEffect(() => {
    if (existingId) return;
    repo.createRecord(db).then(record => {
      setState(s => ({ ...s, recordId: record.id }));
    });
  }, [db, existingId]);

  // Load existing record when editing
  useEffect(() => {
    if (!existingId) return;
    repo.getRecordById(db, existingId).then(record => {
      if (!record) return;
      setState(prev => ({
        ...prev,
        recordId: existingId,
        situation: record.situation,
        situationDate: record.situationDate ?? todayIso(),
        emotions: record.emotions,
        automaticThoughts: record.automaticThoughts,
        evidenceFor: record.evidenceFor,
        evidenceAgainst: record.evidenceAgainst,
        alternativeThought: record.alternativeThought,
        outcome: record.outcome ?? '',
      }));
    }).finally(() => setEditLoading(false));
  }, [existingId, db]);

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
      if (existingId) {
        router.replace(`/(tools)/thought-record/${existingId}`);
      } else {
        router.replace(`/(tools)/thought-record/${state.recordId}`);
      }
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

  if (editLoading) {
    return (
      <View testID="loading-indicator" style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
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
          {currentStep === 1 ? (
            <Text style={styles.btnGhostText}>Anuluj</Text>
          ) : (
            <View style={styles.iconRow}>
              <Ionicons name="arrow-back" size={15} color={colors.textMuted} />
              <Text style={styles.btnGhostText}>Wstecz</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnPrimary, currentStep === TOTAL_STEPS && styles.btnSuccess]}
          onPress={goNext}
          disabled={saving}
        >
          {saving ? (
            <Text style={styles.btnPrimaryText}>...</Text>
          ) : currentStep === TOTAL_STEPS ? (
            <View style={styles.iconRow}>
              <Text style={styles.btnPrimaryText}>Zakończ</Text>
              <Ionicons name="checkmark" size={15} color={colors.bg} />
            </View>
          ) : (
            <View style={styles.iconRow}>
              <Text style={styles.btnPrimaryText}>Dalej</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.bg} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
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
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
