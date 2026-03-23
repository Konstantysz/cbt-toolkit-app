import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';

import { useSettings } from '../../core/settings/store';
import { useColors } from '../../core/theme/useColors';
import { scaledFont } from '../../core/settings/fontScale';
import { requestPermissions } from '../../core/notifications/permissions';
import { scheduleReminder, cancelReminder } from '../../core/notifications/schedule';
import { exportData } from '../../core/data/export';
import { importData } from '../../core/data/import';
import * as ThoughtRecordRepo from '../../tools/thought-record/repository';
import * as ExperimentRepo from '../../tools/behavioral-experiment/repository';
import { pl } from '../../core/i18n/pl';
import { spacing, radius } from '../../core/theme';

const GITHUB_RELEASES = 'https://github.com/your-org/cbt-toolkit/releases';
const GITHUB_ISSUES = 'https://github.com/your-org/cbt-toolkit/issues';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useColors();
  const {
    reminderEnabled, reminderTime, fontSize, reducedMotion, highContrast,
    setReminderEnabled, setReminderTime, setFontSize, setReducedMotion, setHighContrast,
  } = useSettings();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(reminderTime);

  const reminderDate = useMemo(() => {
    const [h, m] = reminderTime.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, [reminderTime]);

  const tempDate = useMemo(() => {
    const [h, m] = tempTime.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, [tempTime]);

  const fs = (base: number) => scaledFont(base, fontSize);

  async function handleToggleReminder(value: boolean) {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          pl.settings.notifications.permissionDenied,
          '',
          [
            { text: pl.common.cancel, style: 'cancel' },
            { text: pl.settings.notifications.permissionDeniedBtn, onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      await scheduleReminder(reminderTime);
      setReminderEnabled(true);
    } else {
      await cancelReminder();
      setReminderEnabled(false);
    }
  }

  function handlePickerChange(_event: unknown, date?: Date) {
    if (!date) return;
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    if (Platform.OS === 'android') {
      // Android closes picker on selection — commit immediately
      setShowTimePicker(false);
      const newTime = `${h}:${m}`;
      setReminderTime(newTime);
      if (reminderEnabled) {
        cancelReminder().then(() => scheduleReminder(newTime));
      }
    } else {
      // iOS fires continuously while spinning — only update local state
      setTempTime(`${h}:${m}`);
    }
  }

  async function commitTimeChange() {
    setShowTimePicker(false);
    setReminderTime(tempTime);
    if (reminderEnabled) {
      await cancelReminder();
      await scheduleReminder(tempTime);
    }
  }

  async function handleExport() {
    try {
      await exportData(db);
    } catch {
      Alert.alert('Błąd', 'Nie udało się wyeksportować danych.');
    }
  }

  async function handleImport() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled || !result.assets?.[0]) return;
      const { imported, skipped } = await importData(db, result.assets[0].uri);
      Alert.alert('Importowano', `Dodano: ${imported}, pominięto: ${skipped}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : pl.settings.data.importError;
      Alert.alert('Błąd importu', msg);
    }
  }

  function handleDeleteAll() {
    Alert.alert(
      pl.settings.data.deleteConfirmTitle,
      pl.settings.data.deleteConfirmMsg,
      [
        { text: pl.common.cancel, style: 'cancel' },
        {
          text: pl.common.delete,
          style: 'destructive',
          onPress: async () => {
            await ThoughtRecordRepo.deleteAll(db);
            await ExperimentRepo.deleteAll(db);
            Alert.alert('Gotowe', 'Wszystkie dane zostały usunięte.');
          },
        },
      ]
    );
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { paddingTop: 56, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
    headerTitle: { fontSize: fs(22), fontWeight: '700', color: colors.text },
    sectionHeader: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xs },
    sectionTitle: { fontSize: fs(11), fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    card: { marginHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14 },
    rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    rowLabel: { flex: 1 },
    rowLabelText: { fontSize: fs(15), color: colors.text, fontWeight: '500' },
    rowSubText: { fontSize: fs(12), color: colors.textMuted, marginTop: 2 },
    rowValue: { fontSize: fs(15), color: colors.textMuted, marginRight: spacing.xs },
    chevron: { fontSize: 18, color: colors.textDim },
    dangerText: { fontSize: fs(15), color: colors.danger, fontWeight: '500' },
    fontSelector: { flexDirection: 'row', gap: spacing.xs },
    fontOption: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    fontOptionActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
    fontOptionText: { color: colors.textMuted, fontWeight: '600' },
    fontOptionTextActive: { color: colors.accent },
    appBlock: { paddingHorizontal: spacing.md, paddingVertical: 14 },
    appName: { fontSize: fs(16), fontWeight: '700', color: colors.text },
    appVersion: { fontSize: fs(12), color: colors.textMuted, marginTop: 2 },
  });

  const fontSizes: { key: 'sm' | 'md' | 'lg'; label: string; size: number }[] = [
    { key: 'sm', label: 'A', size: 12 },
    { key: 'md', label: 'A', size: 15 },
    { key: 'lg', label: 'A', size: 18 },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{pl.nav.settings}</Text>
      </View>

      {/* Powiadomienia */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.notifications.title}</Text>
      </View>
      <View style={s.card}>
        <View style={s.row}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.notifications.reminder}</Text>
            <Text style={s.rowSubText}>{pl.settings.notifications.reminderSub}</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={handleToggleReminder}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.text}
          />
        </View>
        {reminderEnabled && (
          <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => { setTempTime(reminderTime); setShowTimePicker(true); }}>
            <View style={s.rowLabel}>
              <Text style={s.rowLabelText}>{pl.settings.notifications.time}</Text>
            </View>
            <Text style={s.rowValue}>{reminderTime}</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dostępność */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.accessibility.title}</Text>
      </View>
      <View style={s.card}>
        <View style={s.row}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.accessibility.fontSize}</Text>
          </View>
          <View style={s.fontSelector}>
            {fontSizes.map(({ key, label, size }) => (
              <TouchableOpacity
                key={key}
                style={[s.fontOption, fontSize === key && s.fontOptionActive]}
                onPress={() => setFontSize(key)}
              >
                <Text style={[s.fontOptionText, { fontSize: size }, fontSize === key && s.fontOptionTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[s.row, s.rowBorder]}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.accessibility.reducedMotion}</Text>
            <Text style={s.rowSubText}>{pl.settings.accessibility.reducedMotionSub}</Text>
          </View>
          <Switch value={reducedMotion} onValueChange={setReducedMotion} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.text} />
        </View>
        <View style={[s.row, s.rowBorder]}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.accessibility.highContrast}</Text>
            <Text style={s.rowSubText}>{pl.settings.accessibility.highContrastSub}</Text>
          </View>
          <Switch value={highContrast} onValueChange={setHighContrast} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.text} />
        </View>
      </View>

      {/* Dane */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.data.title}</Text>
      </View>
      <View style={s.card}>
        <TouchableOpacity style={s.row} onPress={handleExport}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.data.export}</Text>
            <Text style={s.rowSubText}>{pl.settings.data.exportSub}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={handleImport}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.data.import}</Text>
            <Text style={s.rowSubText}>{pl.settings.data.importSub}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={handleDeleteAll}>
          <View style={s.rowLabel}>
            <Text style={s.dangerText}>{pl.settings.data.deleteAll}</Text>
            <Text style={s.rowSubText}>{pl.settings.data.deleteAllSub}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Zasoby pomocowe */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.resources.title}</Text>
      </View>
      <View style={s.card}>
        <TouchableOpacity style={s.row} onPress={() => Linking.openURL('tel:116123')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.resources.adults}</Text>
            <Text style={s.rowSubText}>116 123</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => Linking.openURL('tel:116111')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.resources.children}</Text>
            <Text style={s.rowSubText}>116 111</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => Linking.openURL('https://centrumwsparcia.pl')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.resources.centrum}</Text>
            <Text style={s.rowSubText}>centrumwsparcia.pl</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* O aplikacji */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{pl.settings.about.title}</Text>
      </View>
      <View style={s.card}>
        <View style={s.appBlock}>
          <Text style={s.appName}>{pl.app.title}</Text>
          <Text style={s.appVersion}>v{Constants.expoConfig?.version ?? '—'}</Text>
        </View>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => router.push('/settings/credits')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.about.credits}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => router.push('/settings/bibliography')}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.about.bibliography}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => Linking.openURL(GITHUB_RELEASES)}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.about.changelog}</Text>
            <Text style={s.rowSubText}>{pl.settings.about.changelogSub}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.row, s.rowBorder]} onPress={() => Linking.openURL(GITHUB_ISSUES)}>
          <View style={s.rowLabel}>
            <Text style={s.rowLabelText}>{pl.settings.about.report}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Time picker */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showTimePicker} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg }}>
              <DateTimePicker
                value={tempDate}
                mode="time"
                display="spinner"
                onChange={handlePickerChange}
                textColor={colors.text}
              />
              <TouchableOpacity
                style={{ alignItems: 'center', paddingVertical: spacing.sm }}
                onPress={commitTimeChange}
              >
                <Text style={{ color: colors.accent, fontSize: fs(16), fontWeight: '600' }}>
                  {pl.common.done}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : (
        showTimePicker && (
          <DateTimePicker
            value={reminderDate}
            mode="time"
            display="default"
            onChange={handlePickerChange}
          />
        )
      )}
    </ScrollView>
  );
}
