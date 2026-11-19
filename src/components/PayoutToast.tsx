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
];

const SMALL_MEDIUM_AMOUNTS = [20000, 28000, 35000, 44000, 50000, 58000, 68000, 75000];
const LARGE_AMOUNTS = [100000, 120000, 145000, 165000, 200000, 235000];
const PREFIXES = ['786', '712', '755', '763', '678', '745', '718', '765'];

interface PayoutNotice {
  key: number;
  name: string;
  phone: string;
  place: string;
  amount: number;
  minutesAgo: number;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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
  const lastWasLargeRef = useRef(false);

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
      // Alternate & mix small/medium payouts (20k–75k) with large payouts (100k–235k)
      const useLarge = lastWasLargeRef.current ? Math.random() < 0.25 : Math.random() < 0.7;
      lastWasLargeRef.current = useLarge;
      const tail = String(Math.floor(100 + Math.random() * 900));

      return {
        key: Date.now() + Math.random(),
        name: pick(NAMES),
        phone: `+255 ${pick(PREFIXES)}...${tail}`,
        place: pick(PLACES),
        amount: useLarge ? pick(LARGE_AMOUNTS) : pick(SMALL_MEDIUM_AMOUNTS),
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

        // Varied interval between 7.5s and 13.5s
        const nextDelay = Math.round(7500 + Math.random() * 6000);
        scheduleNext(nextDelay);
      }, delayMs);
    };

    scheduleNext(2800);

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
