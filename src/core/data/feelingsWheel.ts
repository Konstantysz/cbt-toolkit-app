export interface EmotionNode {
  key: string;
  label: string;
  color: string;
  level: 1 | 2 | 3;
  parentKey?: string;
  children?: EmotionNode[];
}

function l2(
  key: string,
  label: string,
  parentKey: string,
  color: string,
  children: EmotionNode[]
): EmotionNode {
  return { key, label, color, level: 2, parentKey, children };
}

function l3(key: string, label: string, parentKey: string, color: string): EmotionNode {
  return { key, label, color, level: 3, parentKey };
}

export const feelingsWheel: EmotionNode[] = [
  {
    key: 'anger',
    label: 'Złość',
    color: '#e05a5a',
    level: 1,
    children: [
      l2('hostile', 'Wrogi', 'anger', '#e05a5a', [
        l3('furious', 'Wściekły', 'hostile', '#e05a5a'),
        l3('violent', 'Brutalny', 'hostile', '#e05a5a'),
        l3('hateful', 'Pełen nienawiści', 'hostile', '#e05a5a'),
      ]),
      l2('irritable', 'Drażliwy', 'anger', '#e05a5a', [
        l3('annoyed', 'Zirytowany', 'irritable', '#e05a5a'),
        l3('aggravated', 'Rozdrażniony', 'irritable', '#e05a5a'),
        l3('frustrated', 'Sfrustrowany', 'irritable', '#e05a5a'),
      ]),
      l2('disrespected', 'Zlekceważony', 'anger', '#e05a5a', [
        l3('ridiculed', 'Ośmieszony', 'disrespected', '#e05a5a'),
        l3('humiliated', 'Upokorzony', 'disrespected', '#e05a5a'),
        l3('embarrassed', 'Zażenowany', 'disrespected', '#e05a5a'),
      ]),
      l2('resentful', 'Urażony', 'anger', '#e05a5a', [
        l3('bitter', 'Rozgoryczony', 'resentful', '#e05a5a'),
        l3('indignant', 'Oburzony', 'resentful', '#e05a5a'),
        l3('violated', 'Skrzywdzony', 'resentful', '#e05a5a'),
      ]),
      l2('critical', 'Krytyczny', 'anger', '#e05a5a', [
        l3('skeptical', 'Sceptyczny', 'critical', '#e05a5a'),
        l3('dismissive', 'Lekceważący', 'critical', '#e05a5a'),
        l3('contemptuous', 'Pogardliwy', 'critical', '#e05a5a'),
      ]),
      l2('withdrawn', 'Wycofany', 'anger', '#e05a5a', [
        l3('numb', 'Odrętwiony', 'withdrawn', '#e05a5a'),
        l3('suspicious', 'Podejrzliwy', 'withdrawn', '#e05a5a'),
        l3('reluctant', 'Niechętny', 'withdrawn', '#e05a5a'),
      ]),
    ],
  },
  {
    key: 'sadness',
    label: 'Smutek',
    color: '#5a8ee0',
    level: 1,
    children: [
      l2('guilty', 'Winny', 'sadness', '#5a8ee0', [
        l3('ashamed', 'Zawstydzony', 'guilty', '#5a8ee0'),
        l3('regretful', 'Żałujący', 'guilty', '#5a8ee0'),
        l3('remorseful', 'Skruszony', 'guilty', '#5a8ee0'),
      ]),
      l2('abandoned', 'Opuszczony', 'sadness', '#5a8ee0', [
        l3('ignored', 'Ignorowany', 'abandoned', '#5a8ee0'),
        l3('lonely', 'Samotny', 'abandoned', '#5a8ee0'),
        l3('rejected', 'Odrzucony', 'abandoned', '#5a8ee0'),
      ]),
      l2('helpless', 'Bezradny', 'sadness', '#5a8ee0', [
        l3('powerless', 'Bezsilny', 'helpless', '#5a8ee0'),
        l3('vulnerable', 'Bezbronny', 'helpless', '#5a8ee0'),
        l3('fragile', 'Kruchy', 'helpless', '#5a8ee0'),
      ]),
      l2('hopeless', 'Beznadziejny', 'sadness', '#5a8ee0', [
        l3('inferior', 'Gorszy od innych', 'hopeless', '#5a8ee0'),
        l3('empty', 'Pusty w środku', 'hopeless', '#5a8ee0'),
        l3('worthless', 'Bezwartościowy', 'hopeless', '#5a8ee0'),
      ]),
      l2('bored', 'Znudzony', 'sadness', '#5a8ee0', [
        l3('apathetic', 'Apatyczny', 'bored', '#5a8ee0'),
        l3('indifferent', 'Obojętny', 'bored', '#5a8ee0'),
        l3('lost', 'Zagubiony', 'bored', '#5a8ee0'),
      ]),
      l2('depressed', 'Przygnębiony', 'sadness', '#5a8ee0', [
        l3('overwhelmed', 'Przytłoczony', 'depressed', '#5a8ee0'),
        l3('miserable', 'Nieszczęśliwy', 'depressed', '#5a8ee0'),
        l3('exhausted', 'Wyczerpany', 'depressed', '#5a8ee0'),
      ]),
    ],
  },
  {
    key: 'fear',
    label: 'Lęk',
    color: '#9b6ae0',
    level: 1,
    children: [
      l2('scared', 'Przestraszony', 'fear', '#9b6ae0', [
        l3('terrified', 'Przerażony', 'scared', '#9b6ae0'),
        l3('panicked', 'W panice', 'scared', '#9b6ae0'),
        l3('appalled', 'Wstrząśnięty', 'scared', '#9b6ae0'),
      ]),
      l2('anxious', 'Niespokojny', 'fear', '#9b6ae0', [
        l3('worried', 'Zaniepokojony', 'anxious', '#9b6ae0'),
        l3('apprehensive', 'Pełen obaw', 'anxious', '#9b6ae0'),
        l3('nervous', 'Zdenerwowany', 'anxious', '#9b6ae0'),
      ]),
      l2('insecure', 'Niepewny siebie', 'fear', '#9b6ae0', [
        l3('inadequate', 'Nieadekwatny', 'insecure', '#9b6ae0'),
        l3('uncertain', 'Niezdecydowany', 'insecure', '#9b6ae0'),
        l3('excluded', 'Wykluczony', 'insecure', '#9b6ae0'),
      ]),
      l2('submissive', 'Uległy', 'fear', '#9b6ae0', [
        l3('cowardly', 'Tchórzliwy', 'submissive', '#9b6ae0'),
        l3('meek', 'Potulny', 'submissive', '#9b6ae0'),
        l3('spineless', 'Bez charakteru', 'submissive', '#9b6ae0'),
      ]),
      l2('unsettled', 'Rozchwiany', 'fear', '#9b6ae0', [
        l3('uneasy', 'W niepokoju', 'unsettled', '#9b6ae0'),
        l3('troubled', 'Trapiony', 'unsettled', '#9b6ae0'),
        l3('confused', 'Zdezorientowany', 'unsettled', '#9b6ae0'),
      ]),
      l2('startled', 'Zaskoczony', 'fear', '#9b6ae0', [
        l3('shocked', 'Oszołomiony', 'startled', '#9b6ae0'),
        l3('distraught', 'Roztrzęsiony', 'startled', '#9b6ae0'),
        l3('speechless', 'Oniemiały', 'startled', '#9b6ae0'),
      ]),
    ],
  },
  {
    key: 'joy',
    label: 'Radość',
    color: '#e0c05a',
    level: 1,
    children: [
      l2('excited', 'Podekscytowany', 'joy', '#e0c05a', [
        l3('thrilled', 'Zachwycony', 'excited', '#e0c05a'),
        l3('elated', 'W euforii', 'excited', '#e0c05a'),
        l3('energetic', 'Pełen energii', 'excited', '#e0c05a'),
      ]),
      l2('content', 'Zadowolony', 'joy', '#e0c05a', [
        l3('fulfilled', 'Spełniony', 'content', '#e0c05a'),
        l3('satisfied', 'Usatysfakcjonowany', 'content', '#e0c05a'),
        l3('serene', 'Pogodny', 'content', '#e0c05a'),
      ]),
      l2('grateful', 'Wdzięczny', 'joy', '#e0c05a', [
        l3('blessed', 'Błogosławiony', 'grateful', '#e0c05a'),
        l3('appreciative', 'Doceniający', 'grateful', '#e0c05a'),
        l3('thankful', 'Pełen wdzięczności', 'grateful', '#e0c05a'),
      ]),
      l2('loving', 'Kochający', 'joy', '#e0c05a', [
        l3('affectionate', 'Czuły', 'loving', '#e0c05a'),
        l3('compassionate', 'Współczujący', 'loving', '#e0c05a'),
        l3('warm', 'Ciepły', 'loving', '#e0c05a'),
      ]),
      l2('hopeful', 'Pełen nadziei', 'joy', '#e0c05a', [
        l3('optimistic', 'Optymistyczny', 'hopeful', '#e0c05a'),
        l3('inspired', 'Zainspirowany', 'hopeful', '#e0c05a'),
        l3('expectant', 'Z wyczekiwaniem', 'hopeful', '#e0c05a'),
      ]),
      l2('playful', 'Figlarny', 'joy', '#e0c05a', [
        l3('amused', 'Rozbawiony', 'playful', '#e0c05a'),
        l3('creative', 'Twórczy', 'playful', '#e0c05a'),
        l3('cheerful', 'Radosny', 'playful', '#e0c05a'),
      ]),
    ],
  },
  {
    key: 'power',
    label: 'Siła',
    color: '#5ae08a',
    level: 1,
    children: [
      l2('confident', 'Pewny siebie', 'power', '#5ae08a', [
        l3('courageous', 'Odważny', 'confident', '#5ae08a'),
        l3('daring', 'Śmiały', 'confident', '#5ae08a'),
        l3('bold', 'Zuchwały', 'confident', '#5ae08a'),
      ]),
      l2('proud', 'Dumny', 'power', '#5ae08a', [
        l3('accomplished', 'Z poczuciem sukcesu', 'proud', '#5ae08a'),
        l3('successful', 'Odnoszący sukcesy', 'proud', '#5ae08a'),
        l3('important', 'Ważny', 'proud', '#5ae08a'),
      ]),
      l2('valued', 'Doceniany', 'power', '#5ae08a', [
        l3('respected', 'Szanowany', 'valued', '#5ae08a'),
        l3('loved', 'Kochany', 'valued', '#5ae08a'),
        l3('accepted', 'Akceptowany', 'valued', '#5ae08a'),
      ]),
      l2('worthy', 'Wartościowy', 'power', '#5ae08a', [
        l3('deserving', 'Zasługujący', 'worthy', '#5ae08a'),
        l3('recognized', 'Uznany', 'worthy', '#5ae08a'),
        l3('celebrated', 'Świętujący', 'worthy', '#5ae08a'),
      ]),
      l2('capable', 'Zdolny', 'power', '#5ae08a', [
        l3('skilled', 'Kompetentny', 'capable', '#5ae08a'),
        l3('productive', 'Produktywny', 'capable', '#5ae08a'),
        l3('efficient', 'Sprawny', 'capable', '#5ae08a'),
      ]),
      l2('assertive', 'Stanowczy', 'power', '#5ae08a', [
        l3('determined', 'Zdeterminowany', 'assertive', '#5ae08a'),
        l3('persistent', 'Wytrwały', 'assertive', '#5ae08a'),
        l3('strong', 'Silny', 'assertive', '#5ae08a'),
      ]),
    ],
  },
  {
    key: 'peace',
    label: 'Spokój',
    color: '#5ad4e0',
    level: 1,
    children: [
      l2('calm', 'Spokojny', 'peace', '#5ad4e0', [
        l3('relaxed', 'Odprężony', 'calm', '#5ad4e0'),
        l3('tranquil', 'Beztroski', 'calm', '#5ad4e0'),
        l3('restful', 'Wypoczęty', 'calm', '#5ad4e0'),
      ]),
      l2('trusting', 'Ufający', 'peace', '#5ad4e0', [
        l3('open', 'Otwarty', 'trusting', '#5ad4e0'),
        l3('faithful', 'Wierny', 'trusting', '#5ad4e0'),
        l3('receptive', 'Chłonny', 'trusting', '#5ad4e0'),
      ]),
      l2('nurturing', 'Opiekuńczy', 'peace', '#5ad4e0', [
        l3('caring', 'Troskliwy', 'nurturing', '#5ad4e0'),
        l3('gentle', 'Łagodny', 'nurturing', '#5ad4e0'),
        l3('kind', 'Życzliwy', 'nurturing', '#5ad4e0'),
      ]),
      l2('present', 'Obecny', 'peace', '#5ad4e0', [
        l3('mindful', 'Uważny', 'present', '#5ad4e0'),
        l3('aware', 'Świadomy', 'present', '#5ad4e0'),
        l3('centered', 'Zcentrowany', 'present', '#5ad4e0'),
      ]),
      l2('connected', 'Połączony z innymi', 'peace', '#5ad4e0', [
        l3('belonging', 'Przynależający', 'connected', '#5ad4e0'),
        l3('intimate', 'Blisko z innymi', 'connected', '#5ad4e0'),
        l3('close', 'Zżyty', 'connected', '#5ad4e0'),
      ]),
      l2('grounded', 'Uziemiony', 'peace', '#5ad4e0', [
        l3('secure', 'Bezpieczny', 'grounded', '#5ad4e0'),
        l3('stable', 'Stabilny', 'grounded', '#5ad4e0'),
        l3('safe', 'W bezpiecznym miejscu', 'grounded', '#5ad4e0'),
      ]),
    ],
  },
];
