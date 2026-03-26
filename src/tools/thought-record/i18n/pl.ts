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
  helper: {
    toggle: 'Wskazówka',
    exampleLabel: 'Przykład',
    hints: {
      step1: 'Opisz co, gdzie, kiedy i z kim. Dodaj kontekst fizyczny: czy byłeś głodny, zmęczony, samotny, zły (metoda HALT)? Czy ta sytuacja zdarzyła się po raz pierwszy, czy to powtarzający się wzorzec?',
      step3: '„np. Nie dam rady. Wszyscy widzą, że jestem słaby. Coś jest ze mną nie tak."',
      step4: '„np. Tydzień temu zapomniałem o ważnym spotkaniu. Zdarza mi się mylić daty."',
      step5: '„np. Przez ostatni rok nie miałem poważnych problemów w pracy. Szef niedawno mnie pochwalił."',
      step6: '„np. Odczuwam niepokój, ale to uczucie przeminie. Mam dowody na to, że sobie radzę."',
    },
  },
  search: {
    placeholder: 'Szukaj wpisów...',
    noResults: (q: string) => `Brak wyników dla „${q}"`,
  },
  onboarding: {
    badge: 'Przykład',
    deleteNote: 'To jest przykładowy wpis. Możesz go usunąć, gdy nie jest już potrzebny.',
  },
  form: {
    title: 'Formularz Zapisu Myśli',
    btn: 'Formularz',
    sections: {
      situation: 'Sytuacja',
      emotionsBefore: 'Emocje przed',
      automaticThought: 'Myśl automatyczna',
      evidenceFor: 'Dowody potwierdzające',
      evidenceAgainst: 'Dowody przeczące',
      alternativeThought: 'Myśli alternatywne',
      emotionsAfter: 'Emocje po',
    },
    export: {
      pdf: 'Eksportuj PDF',
      png: 'Eksportuj PNG',
      errorTitle: 'Błąd eksportu',
      errorMsg: 'Nie udało się wyeksportować formularza. Spróbuj ponownie.',
    },
  },
};
