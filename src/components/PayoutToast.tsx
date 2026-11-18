import { CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { formatTsh } from '../constants/config';
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

const AMOUNTS = [15000, 22000, 28500, 34000, 41000, 50000, 63000, 75000, 88000];
const PREFIXES = ['786', '712', '755', '763', '678', '745'];

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

function createNotice(): PayoutNotice {
  const tail = String(Math.floor(100 + Math.random() * 900));
  return {
    key: Date.now(),
    name: pick(NAMES),
    phone: `+255 ${pick(PREFIXES)}...${tail}`,
    place: pick(PLACES),
    amount: pick(AMOUNTS),
    minutesAgo: Math.floor(Math.random() * 7) + 1,
  };
}

export function PayoutToast() {
  const [notice, setNotice] = useState<PayoutNotice | null>(null);

  useEffect(() => {
    const handleUnlock = () => unlockAudio();
    window.addEventListener('pointerdown', handleUnlock, { once: true });
    window.addEventListener('keydown', handleUnlock, { once: true });

    let hideTimeout: number | undefined;

    const showToast = () => {
      setNotice(createNotice());
      playNotificationChime();
      hideTimeout = window.setTimeout(() => {
        setNotice(null);
      }, 4800);
    };

    const initialTimer = window.setTimeout(showToast, 3200);
    const interval = window.setInterval(showToast, 11000);

    return () => {
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
      if (hideTimeout) window.clearTimeout(hideTimeout);
    };
  }, []);

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
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[22px] border border-emerald-400/25 bg-[#0B1220]/95 p-3.5 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-semibold text-white">
                {notice.name}{' '}
                <span className="font-mono text-slate-400 tabular-nums">({notice.phone})</span>
              </p>
              <p className="mt-0.5 leading-snug text-slate-200">
                ametoa{' '}
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {formatTsh(notice.amount)}
                </span>{' '}
                akiwa {notice.place}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Dakika {notice.minutesAgo} zilizopita · Malipo yamefanikiwa
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="grid size-6 shrink-0 place-items-center rounded-lg text-slate-400 transition active:scale-90 hover:bg-slate-800 hover:text-white"
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
