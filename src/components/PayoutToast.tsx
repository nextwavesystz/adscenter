import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { playNotificationChime, unlockAudio } from '../utils/sound';

const FIRST_NAMES = [
  'Rehema',
  'Juma',
  'Abdallah',
  'Sara',
  'Salome',
  'Amina',
  'John',
  'David',
  'Sadiki',
  'Rosemary',
  'Mariam',
  'Hassan',
  'Jumanne',
  'Kuria',
  'Julie',
  'Neema',
  'Baraka',
  'Asha',
  'Grace',
  'Rajabu',
  'Halima',
  'Emmanuel',
  'Kelvin',
  'Hamisi',
  'Salma',
  'Ibrahimu',
  'Joyce',
  'Mohamed',
  'Upendo',
  'Daniel',
  'Zuhura',
  'Godfrey',
  'Farida',
  'Paschal',
  'Mwajuma',
  'Elias',
  'Nasra',
  'Jackson',
  'Beatrice',
  'Yusuph',
  'Erick',
  'Pendo',
  'Ramadhani',
  'Fatuma',
  'Josephat',
  'Rukia',
  'Dickson',
  'Subira',
  'Omary',
  'Janeth',
  'Benedict',
  'Agnes',
  'Irene',
  'Steven',
  'Sophia',
  'Esther',
  'Joseph',
  'Zainabu',
  'Bakari',
  'Victor',
];

const SURNAMES = [
  'Mushi',
  'Massawe',
  'Kimaro',
  'Mwakalindile',
  'Msigwa',
  'Mwenda',
  'Mkumbwa',
  'Mapunda',
  'Shayo',
  'Chacha',
  'Mbwambo',
  'Ally',
  'Nassoro',
  'Shirima',
  'Ndomba',
  'Omari',
  'Lyimo',
  'Selemani',
  'Nyoni',
  'Shabani',
  'Mwakalinga',
  'Mhando',
  'Tarimo',
  'Mwinuka',
  'Mfugale',
  'Mwasote',
  'Kessy',
  'Salum',
  'Komba',
  'Issa',
  'Magesa',
  'Rashid',
  'Mkude',
  'Mgaya',
  'Maulid',
  'Mosha',
  'Nkwabi',
  'Mfinanga',
  'Ngowi',
  'Lema',
  'Kondo',
  'Mwandambo',
  'Temba',
  'Msuya',
  'Mgonja',
  'Kiwelu',
  'Makame',
  'Nanyaro',
  'Ndunguru',
  'Pallangyo',
  'Mwambene',
  'Kileo',
  'Mariki',
  'Swai',
  'Kaaya',
  'Mrema',
  'Mbise',
  'Kitomari',
  'Mnzava',
  'Mchomvu',
];

const PLACES = [
  'Dar es Salaam',
  'Mwanza',
  'Arusha',
  'Dodoma',
  'Mbeya',
  'Morogoro',
  'Tanga',
  'Zanzibar',
  'Iringa',
  'Moshi',
  'Tabora',
  'Kigoma',
  'Shinyanga',
  'Bukoba',
  'Mtwara',
  'Songea',
  'Singida',
  'Musoma',
  'Kahama',
  'Babati',
];

type AmountBracket = 'low' | 'mid' | 'upper' | 'high';
const BRACKETS: readonly AmountBracket[] = ['low', 'mid', 'upper', 'high'];
const PREFIXES = ['786', '712', '755', '763', '678', '745', '718', '765', '754', '655', '784'];
const SEEN_PAIRS_KEY = 'adscenter_toast_seen_pairs_v2';

interface PayoutNotice {
  key: number;
  name: string;
  phone: string;
  place: string;
  amount: number;
  minutesAgo: number;
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function drawFromDeck<T>(deckRef: { current: T[] }, source: readonly T[], lastValue?: T): T {
  if (deckRef.current.length === 0) {
    const reshuffled = shuffleArray(source);
    if (lastValue !== undefined && reshuffled.length > 1 && reshuffled[0] === lastValue) {
      const swapIdx = 1 + Math.floor(Math.random() * (reshuffled.length - 1));
      [reshuffled[0], reshuffled[swapIdx]] = [reshuffled[swapIdx], reshuffled[0]];
    }
    deckRef.current = reshuffled;
  }
  return deckRef.current.shift() as T;
}

function loadSeenPairs(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.sessionStorage.getItem(SEEN_PAIRS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((s): s is string => typeof s === 'string'))
      : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenPairs(seen: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SEEN_PAIRS_KEY, JSON.stringify([...seen].slice(-250)));
  } catch {
    // Ignore storage errors
  }
}

function generateDynamicAmount(bracket: AmountBracket, recentAmounts: number[]): number {
  const randomHundred = (min: number, max: number) => {
    // Occasional clean thousand (~15%), mostly natural hundreds like 196,700 or 58,400
    const step = Math.random() < 0.15 ? 1000 : 100;
    const count = Math.floor((max - min) / step) + 1;
    return min + Math.floor(Math.random() * count) * step;
  };

  for (let attempt = 0; attempt < 15; attempt += 1) {
    let candidate = 54300;
    if (bracket === 'low') {
      candidate = randomHundred(10200, 79800);
    } else if (bracket === 'mid') {
      candidate = randomHundred(82400, 298900);
    } else if (bracket === 'upper') {
      candidate = randomHundred(304200, 658700);
    } else {
      candidate = Math.random() < 0.12 ? 1000000 : randomHundred(665400, 994800);
    }

    if (!recentAmounts.includes(candidate)) {
      return candidate;
    }
  }

  return 196700;
}

function formatTzs(amount: number): string {
  return `${amount.toLocaleString('en-US')} TZS`;
}

function VerifiedBlueTick() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 shrink-0 drop-shadow-sm" aria-hidden="true">
      <path
        fill="#1D9BF0"
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
      />
      <path
        fill="#FFFFFF"
        d="M10.54 16.2l-3.68-3.68 1.42-1.41 2.26 2.26 5.18-5.18 1.41 1.42-6.59 6.59z"
      />
    </svg>
  );
}

interface PayoutToastProps {
  enabled?: boolean;
}

export function PayoutToast({ enabled = true }: PayoutToastProps) {
  const [notice, setNotice] = useState<PayoutNotice | null>(null);
  const firstDeckRef = useRef<string[]>([]);
  const surnameDeckRef = useRef<string[]>([]);
  const placeDeckRef = useRef<string[]>([]);
  const bracketDeckRef = useRef<AmountBracket[]>([]);
  const lastFirstRef = useRef<string | undefined>(undefined);
  const lastSurnameRef = useRef<string | undefined>(undefined);
  const lastPlaceRef = useRef<string | undefined>(undefined);
  const lastBracketRef = useRef<AmountBracket | undefined>(undefined);
  const recentAmountsRef = useRef<number[]>([]);
  const seenPairsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const handleUnlock = () => unlockAudio();
    window.addEventListener('pointerdown', handleUnlock, { once: true });
    window.addEventListener('keydown', handleUnlock, { once: true });

    if (!enabled) {
      setNotice(null);
      return () => {
        window.removeEventListener('pointerdown', handleUnlock);
        window.removeEventListener('keydown', handleUnlock);
      };
    }

    if (!seenPairsRef.current) {
      seenPairsRef.current = loadSeenPairs();
    }

    let cancelled = false;
    let nextTimer: number | undefined;
    let hideTimer: number | undefined;

    const createMixedNotice = (): PayoutNotice => {
      const seen = seenPairsRef.current ?? new Set<string>();
      let fullName = '';

      for (let i = 0; i < 15; i += 1) {
        const first = drawFromDeck(firstDeckRef, FIRST_NAMES, lastFirstRef.current);
        let surname = drawFromDeck(surnameDeckRef, SURNAMES, lastSurnameRef.current);
        if (first.toLowerCase() === surname.toLowerCase()) {
          surname = drawFromDeck(surnameDeckRef, SURNAMES, surname);
        }
        const candidate = `${first} ${surname}`;
        lastFirstRef.current = first;
        lastSurnameRef.current = surname;
        if (!seen.has(candidate)) {
          fullName = candidate;
          break;
        }
        fullName = candidate;
      }

      seen.add(fullName);
      saveSeenPairs(seen);

      const place = drawFromDeck(placeDeckRef, PLACES, lastPlaceRef.current);
      lastPlaceRef.current = place;

      let bracket = drawFromDeck(bracketDeckRef, BRACKETS, lastBracketRef.current);
      if (lastBracketRef.current === 'low' && bracket === 'low') {
        bracket = 'high';
      }
      lastBracketRef.current = bracket;

      const amount = generateDynamicAmount(bracket, recentAmountsRef.current);
      recentAmountsRef.current = [amount, ...recentAmountsRef.current].slice(0, 15);

      const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
      const tail = String(Math.floor(100 + Math.random() * 900));

      return {
        key: Date.now() + Math.random(),
        name: fullName,
        phone: `+255 ${prefix}...${tail}`,
        place,
        amount,
        minutesAgo: Math.floor(Math.random() * 6) + 1,
      };
    };

    const scheduleNext = (delayMs: number) => {
      nextTimer = window.setTimeout(() => {
        if (cancelled) return;
        setNotice(createMixedNotice());
        playNotificationChime();

        const visibleDuration = Math.round(4200 + Math.random() * 1100);
        hideTimer = window.setTimeout(() => {
          if (cancelled) return;
          setNotice(null);

          const nextDelay = Math.round(2500 + Math.random() * 7000);
          scheduleNext(nextDelay);
        }, visibleDuration);
      }, delayMs);
    };

    scheduleNext(Math.round(2000 + Math.random() * 1400));

    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
      if (nextTimer) window.clearTimeout(nextTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [enabled]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-18 z-[70] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {notice && (
          <motion.div
            key={notice.key}
            initial={{ opacity: 0, y: -24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[22px] border border-sky-400/35 bg-[#0A1931]/95 p-3.5 text-white shadow-2xl shadow-blue-950/40 backdrop-blur-xl"
          >
            <VerifiedBlueTick />

            <div className="min-w-0 flex-1 text-xs">
              <p className="font-bold text-white">
                {notice.name}{' '}
                <span className="font-mono font-semibold text-blue-200/85 tabular-nums">
                  ({notice.phone})
                </span>
              </p>
              <p className="mt-0.5 font-bold leading-snug text-white">
                ametoa{' '}
                <span className="font-mono font-extrabold text-sky-300 tabular-nums">
                  {formatTzs(notice.amount)}
                </span>{' '}
                akiwa {notice.place}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-blue-100/85">
                Dakika {notice.minutesAgo} zilizopita · Malipo yamefanikiwa
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotice(null)}
              className="grid size-6 shrink-0 place-items-center rounded-lg text-blue-200/75 transition active:scale-90 hover:bg-[#13294E] hover:text-white"
              aria-label="Funga taarifa"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
