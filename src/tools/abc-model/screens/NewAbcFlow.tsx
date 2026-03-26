import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '../../../core/theme';
import { StepProgress } from '../../../core/components/StepProgress';
import { StepHelper } from '../../../core/components/StepHelper';
import { pl } from '../i18n/pl';
import * as repo from '../repository';
import type { AbcEntry } from '../types';

const TOTAL_STEPS = 2;

interface FlowState {
  entryId: string | null;
  situation: string;
  thoughts: string;
  behaviors: string;
  emotions: string;
  physicalSymptoms: string;
}

interface Props {
  existingId?: string;
}

export function NewAbcFlow({ existingId }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<FlowState>({
    entryId: null, situation: '', thoughts: '',
    behaviors: '', emotions: '', physicalSymptoms: '',
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      if (existingId) {
        const entry = await repo.getEntryById(db, existingId);
        if (entry) {
          setState({
            entryId: entry.id,
            situation: entry.situation,
            thoughts: entry.thoughts,
            behaviors: entry.behaviors,
            emotions: entry.emotions,
            physicalSymptoms: entry.physicalSymptoms,
          });
          setStep(1);
        }
      } else {
        const entry: AbcEntry = await repo.createEntry(db);
        setState(prev => ({ ...prev, entryId: entry.id }));
      }
    })();
  }, [db, existingId]);

  const update = useCallback((field: keyof Omit<FlowState, 'entryId'>, value: string) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = useCallback(async () => {
    if (!state.entryId) return;
    setSaving(true);
    try {
      await repo.updateEntry(db, state.entryId, {
        situation: state.situation,
        thoughts: state.thoughts,
        isComplete: false,
        currentStep: 1,
      });
      setStep(2);
    } finally {
      setSaving(false);
    }
  }, [db, state]);

  const handleSave = useCallback(async () => {
    if (!state.entryId) return;
    setSaving(true);
    try {
      await repo.updateEntry(db, state.entryId, {
        behaviors: state.behaviors,
        emotions: state.emotions,
        physicalSymptoms: state.physicalSymptoms,
        isComplete: true,
        currentStep: 2,
      });
      router.navigate(`/(tools)/abc-model/${state.entryId}`);
    } finally {
      setSaving(false);
    }
  }, [db, state]);

  if (!state.entryId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {step === 1 ? (
          <Step1 state={state} update={update} />
        ) : (
          <Step2 state={state} update={update} />
        )}
      </ScrollView>
      <View style={styles.footer}>
        {step === 1 ? (
          <TouchableOpacity
            style={[styles.btn, saving && styles.btnDisabled]}
            onPress={handleNext}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{pl.flow.next}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{pl.flow.save}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function Step1({
  state,
  update,
}: {
  state: FlowState;
  update: (field: keyof Omit<FlowState, 'entryId'>, value: string) => void;
}): React.JSX.Element {
  return (
    <View style={styles.stepBody}>
      <Text style={styles.fieldTitle}>{pl.step1.situationLabel}</Text>
      <TextInput
        style={styles.input}
        value={state.situation}
        onChangeText={v => update('situation', v)}
        placeholder={pl.step1.situationPlaceholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <Text style={[styles.fieldTitle, { marginTop: 20 }]}>{pl.step1.thoughtsLabel}</Text>
      <TextInput
        style={styles.input}
        value={state.thoughts}
        onChangeText={v => update('thoughts', v)}
        placeholder={pl.step1.thoughtsPlaceholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.helper.step1Hint} toggleLabel={pl.helper.toggle} exampleLabel={pl.helper.exampleLabel} />
    </View>
  );
}

function Step2({
  state,
  update,
}: {
  state: FlowState;
  update: (field: keyof Omit<FlowState, 'entryId'>, value: string) => void;
}): React.JSX.Element {
  return (
    <View style={styles.stepBody}>
      <Text style={styles.fieldTitle}>{pl.step2.behaviorsLabel}</Text>
      <TextInput
        style={styles.input}
        value={state.behaviors}
        onChangeText={v => update('behaviors', v)}
        placeholder={pl.step2.behaviorsPlaceholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <Text style={[styles.fieldTitle, { marginTop: 20 }]}>{pl.step2.emotionsLabel}</Text>
      <TextInput
        style={styles.input}
        value={state.emotions}
        onChangeText={v => update('emotions', v)}
        placeholder={pl.step2.emotionsPlaceholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <Text style={[styles.fieldTitle, { marginTop: 20 }]}>{pl.step2.physicalLabel}</Text>
      <TextInput
        style={styles.input}
        value={state.physicalSymptoms}
        onChangeText={v => update('physicalSymptoms', v)}
        placeholder={pl.step2.physicalPlaceholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.helper.step2Hint} toggleLabel={pl.helper.toggle} exampleLabel={pl.helper.exampleLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20 },
  stepBody: { flex: 1 },
  fieldTitle: { fontSize: 17, color: colors.accent, fontWeight: '500', marginBottom: 10 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    padding: 15, fontSize: 15, color: colors.text,
    lineHeight: 24, minHeight: 80,
  },
  footer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  btn: {
    backgroundColor: colors.accent, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 15, fontWeight: '600', color: colors.bg, letterSpacing: 0.02 },
});
