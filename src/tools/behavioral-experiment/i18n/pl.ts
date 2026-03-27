export const pl = {
  toolName: 'Eksperyment Behawioralny',
  toolDescription: 'Testuj swoje przekonania przez działanie',
  list: {
    title: 'Eksperymenty',
    empty: 'Brak eksperymentów',
    emptySub: 'Dotknij + aby zaplanować pierwszy eksperyment.',
    new: 'Nowy eksperyment',
    searchPlaceholder: 'Szukaj eksperymentów...',
    noResults: (q: string) => `Brak wyników dla „${q}"`,
  },
  status: {
    planned: 'Zaplanowany',
    completed: 'Ukończony',
  },
  // Plan phase
  step1: {
    title: 'Jaką myśl chcesz zweryfikować?',
    hint: 'Wpisz konkretne przekonanie, które chcesz sprawdzić działaniem. Np. „Jeśli powiem nie, wszyscy się obrażą."',
    placeholder: 'Np. Jeśli odmówię szefowi, zwolni mnie...',
    sliderLabel: 'Jak mocno wierzysz w tę myśl teraz? (%)',
  },
  step2: {
    title: 'Co konkretnie zrobisz?',
    hint: 'Opisz eksperyment — konkretną sytuację, działanie lub zachowanie, które sprawdzi twoją myśl.',
    placeholder: 'Np. W piątek na 1:1 powiem szefowi, że nie mogę wziąć dodatkowego projektu...',
  },
  step3: {
    title: 'Jak myślisz — co się stanie?',
    hint: 'Zapisz przewidywanie zanim przeprowadzisz eksperyment.',
    placeholder: 'Np. Szef się zdenerwuje i zacznie traktować mnie gorzej...',
  },
  step4: {
    title: 'Co może przeszkodzić?',
    hint: 'Jakie przeszkody mogą uniemożliwić przeprowadzenie eksperymentu?',
    placeholder: 'Np. Mogę się bać i w ostatniej chwili zmienić zdanie...',
  },
  step5: {
    title: 'Jak sobie z tym poradzisz?',
    hint: 'Jak zaradzić tym potencjalnym problemom? Zaplanuj strategie z wyprzedzeniem.',
    placeholder: 'Np. Przed rozmową przypomnę sobie, że mam prawo do odmowy...',
  },
  // Result phase
  step6: {
    title: 'Co się wydarzyło?',
    hint: 'Opisz rzeczywisty wynik eksperymentu. Co zaobserwowałeś?',
    placeholder: 'Np. Szef przyjął to spokojnie i powiedział, że docenia szczerość...',
    dateLabel: 'Data wykonania',
  },
  step7: {
    title: 'Oceń wynik eksperymentu',
    hint: 'W jakim stopniu wynik potwierdził twoją myśl? Jak mocno wierzysz w nią teraz?',
    confirmationLabel: 'Wynik potwierdza myśl w %',
    beliefAfterLabel: 'Jak mocno wierzysz w tę myśl teraz? (%)',
  },
  step8: {
    title: 'Czego nauczył cię ten eksperyment?',
    hint: 'Opisz wnioski. Co to mówi o twoim pierwotnym przekonaniu?',
    placeholder:
      'Np. Moje przekonanie było błędne. Odmowa nie skończyła się żadnymi negatywnymi konsekwencjami...',
  },
  detail: {
    belief: 'Weryfikowana myśl',
    beliefStrengthBefore: 'Przekonanie przed',
    beliefStrengthAfter: 'Przekonanie po',
    planSection: 'Plan',
    resultSection: 'Wynik',
    plan: 'Eksperyment',
    predictedOutcome: 'Przewidywana reakcja',
    potentialProblems: 'Potencjalne problemy',
    problemStrategies: 'Strategie rozwiązania',
    executionDate: 'Data wykonania',
    actualOutcome: 'Co się wydarzyło',
    confirmationPercent: 'Potwierdzenie myśli',
    conclusion: 'Czego się nauczyłem',
    addResult: 'Dodaj wynik',
    edit: 'Edytuj',
    delete: 'Usuń',
  },
  nav: {
    next: 'Dalej',
    back: 'Wstecz',
    finish: 'Zakończ',
  },
  onboarding: {
    badge: 'Przykład',
  },
};
