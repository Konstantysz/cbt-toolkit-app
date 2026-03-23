import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '../../core/theme/useColors';
import { useSettings } from '../../core/settings/store';
import { scaledFont } from '../../core/settings/fontScale';
import { spacing, radius } from '../../core/theme';

const REFERENCES = [
  { author: 'Beck, A. T.', year: '1979', title: 'Cognitive Therapy of Depression', publisher: 'Guilford Press' },
  { author: 'Burns, D. D.', year: '1980', title: 'Feeling Good: The New Mood Therapy', publisher: 'William Morrow' },
  { author: 'Beck, J. S.', year: '2011', title: 'Cognitive Behavior Therapy: Basics and Beyond (2nd ed.)', publisher: 'Guilford Press' },
  { author: 'Popiel, A., Pragłowska, E.', year: '2008', title: 'Psychoterapia poznawczo-behawioralna: Teoria i praktyka', publisher: 'Paradygmat, Warszawa' },
  { author: 'Bennett-Levy, J. et al.', year: '2004', title: 'Oxford Guide to Behavioural Experiments in Cognitive Therapy', publisher: 'Oxford University Press' },
];

export default function BibliographyScreen() {
  const router = useRouter();
  const colors = useColors();
  const { fontSize } = useSettings();
  const fs = (base: number) => scaledFont(base, fontSize);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    backText: { fontSize: fs(16), color: colors.accent, marginRight: spacing.sm },
    headerTitle: { fontSize: fs(20), fontWeight: '700', color: colors.text },
    card: { margin: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
    ref: { marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    refLast: { marginBottom: 0, paddingBottom: 0, borderBottomWidth: 0 },
    refAuthor: { fontSize: fs(14), color: colors.text, fontWeight: '600' },
    refTitle: { fontSize: fs(14), color: colors.accent, fontStyle: 'italic', marginTop: 2 },
    refMeta: { fontSize: fs(12), color: colors.textMuted, marginTop: 2 },
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backText}>‹ Wstecz</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Źródła i bibliografia</Text>
      </View>
      <View style={s.card}>
        {REFERENCES.map((ref, i) => (
          <View key={ref.author} style={i === REFERENCES.length - 1 ? s.refLast : s.ref}>
            <Text style={s.refAuthor}>{ref.author} ({ref.year})</Text>
            <Text style={s.refTitle}>{ref.title}</Text>
            <Text style={s.refMeta}>{ref.publisher}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
