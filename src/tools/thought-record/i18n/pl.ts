export const pl = {
  toolName: 'Zapis Myśli',
  toolDescription: 'Zapisuj i analizuj swoje myśli automatyczne',
  step1: {
    title: 'Sytuacja',
    prompt: 'Co się wydarzyło? Opisz sytuację.',
    dateLabel: 'Kiedy to się wydarzyło?',
  },
  step2: {
    title: 'Emocje',
    prompt: 'Jakie emocje odczuwałeś/aś?',
    intensityLabel: 'Intensywność (0-100%)',
  },
  step3: {
    title: 'Myśli automatyczne',
    prompt: 'Jakie myśli przyszły Ci do głowy?',
  },
  step4: {
    title: 'Argumenty za',
    prompt: 'Jakie są dowody potwierdzające tę myśl?',
  },
  step5: {
    title: 'Argumenty przeciw',
    prompt: 'Jakie są dowody obalające tę myśl?',
  },
  step6: {
    title: 'Myśl alternatywna',
    prompt: 'Jak inaczej możesz o tym pomyśleć?',
  },
  step7: {
    title: 'Podsumowanie',
    prompt: 'Jak się teraz czujesz? Oceń ponownie emocje.',
    intensityAfterLabel: 'Intensywność po ćwiczeniu',
  },
  compare: {
    title: 'Widok porównawczy',
    btnLabel: 'Porównaj',
    page1: 'Sytuacja + Emocje',
    page2: 'Emocje + Myśli automatyczne',
    page3: 'Myśli + Argumenty za i przeciw',
    page4: 'Za + Przeciw + Alternatywa',
  },
  edit: {
    title: 'Edytuj zapis',
  },
} as const;
