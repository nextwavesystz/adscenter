import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { playNotificationChime, unlockAudio } from '../utils/sound';

const NAMES = [
  'Juma Mwakalindile',
  'Neema Msigwa',
  'Baraka Mwenda',
  'Asha Ramadhani',
  'Said Mkumbwa',
  'Grace Mushi',
  'Rajabu Kimaro',
  'Zawadi Mapunda',
  'Frank Massawe',
  'Halima Juma',
  'Emmanuel Shayo',
  'Rehema Chacha',
  'Kelvin Mbwambo',
  'Mariam Ally',
  'Hamisi Bakari',
  'Salma Athumani',
  'Ibrahimu Mwasambili',
  'Joyce Kileo',
  'Mohamed Nassoro',
  'Upendo Shirima',
  'Daniel Ndomba',
  'Zuhura Omari',
  'Godfrey Lyimo',
  'Farida Selemani',
  'Paschal Nyoni',
  'Mwajuma Shabani',
  'Elias Mwakalinga',
  'Nasra Abdallah',
  'Jackson Mhando',
  'Beatrice Tarimo',
  'Yusuph Hassani',
  'Amina Mwinuka',
  'Erick Mfugale',
  'Pendo Mwasote',
  'Ramadhani Kessy',
  'Fatuma Salum',
  'Josephat Komba',
  'Rukia Issa',
  'Dickson Magesa',
  'Mwanahawa Rashid',
  'Deogratius Mkude',
  'Subira Mgaya',
  'Omary Maulid',
  'Janeth Mosha',
  'Benedict Nkwabi',
  'Hawa Mfinanga',
  'Shabani Ngowi',
  'Agnes Lema',
  'Hassan Mnyagatwa',
  'Zaituni Kondo',
  'Meshack Mwandambo',
  'Irene Mushi',
  'Abdulrahman Msuya',
  'Happiness Mgonja',
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

const ALL_AMOUNTS = [
  10000, 18000, 25000, 38000, 50000, 58000, 75000, 95000,
  120000, 165000, 200000, 270000, 300000, 360000, 400000, 450000,
  500000, 580000, 650000, 700000, 780000, 850000, 920000, 1000000,
];

const PREFIXES = ['786', '712', '755', '763', '678', '745', '718', '765', '754', '655', '784'];

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

function formatTzs(amount: number): string {
  return `${amount.toLocaleString('en-US')} TZS`;
}

function VerifiedBlueTick() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-8 shrink-0 drop-shadow-sm"
      aria-hidden="true"
    >
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
  const nameDeckRef = useRef<string[]>([]);
  const placeDeckRef = useRef<string[]>([]);
  const amountDeckRef = useRef<number[]>([]);
  const lastNameRef = useRef<string | undefined>(undefined);
  const lastPlaceRef = useRef<string | undefined>(undefined);
  const lastAmountRef = useRef<number | undefined>(undefined);

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

    let cancelled = false;
    let nextTimer: number | undefined;
    let hideTimer: number | undefined;

    const createMixedNotice = (): PayoutNotice => {
      const name = drawFromDeck(nameDeckRef, NAMES, lastNameRef.current);
      lastNameRef.current = name;

      const place = drawFromDeck(placeDeckRef, PLACES, lastPlaceRef.current);
      lastPlaceRef.current = place;

      let amount = drawFromDeck(amountDeckRef, ALL_AMOUNTS, lastAmountRef.current);
      // Avoid consecutive low-only streaks by ensuring a follow-up pulls >= 100,000 TZS
      if (lastAmountRef.current !== undefined && lastAmountRef.current < 100000 && amount < 100000) {
        const higherIdx = amountDeckRef.current.findIndex((a) => a >= 100000);
        if (higherIdx !== -1) {
          const swapped = amountDeckRef.current[higherIdx];
          amountDeckRef.current[higherIdx] = amount;
          amount = swapped;
        }
      }
      lastAmountRef.current = amount;

      const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
      const tail = String(Math.floor(100 + Math.random() * 900));

      return {
        key: Date.now() + Math.random(),
        name,
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

        hideTimer = window.setTimeout(() => {
          if (!cancelled) setNotice(null);
        }, 4800);

        const nextDelay = Math.round(7000 + Math.random() * 6500);
        scheduleNext(nextDelay);
      }, delayMs);
    };

    scheduleNext(2600);

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
