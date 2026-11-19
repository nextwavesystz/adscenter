import { ArrowRight, Play, ShieldCheck, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { REGISTER_URL } from '../constants/config';
import { unlockAudio } from '../utils/sound';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const handleStart = () => {
    unlockAudio();
    onEnter();
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#050E1F] text-white"
    >
      {/* Atmospheric Navy Depth Layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(21, 94, 239, 0.38), transparent 70%), radial-gradient(circle at 85% 85%, rgba(56, 189, 248, 0.16), transparent 45%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top Navigation Brand Strip */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 pt-6 sm:px-8">
        <div className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#155EEF] to-[#0B3B9E] text-sky-300 ring-1 ring-sky-300/30 shadow-lg shadow-blue-950/50">
            <Play className="size-4 fill-current" aria-hidden="true" />
          </span>
          <span>AdsCenter</span>
        </div>

        <a
          href={REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-blue-100 backdrop-blur-md transition hover:border-sky-300/40 hover:bg-white/10 hover:text-white"
        >
          Fungua Account
        </a>
      </header>

      {/* Center Editorial Hero */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center justify-center px-5 py-10 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-400/25 bg-[#0C2147]/80 px-4 py-2 text-xs font-bold tracking-[0.22em] text-sky-300 uppercase backdrop-blur-md"
        >
          <ShieldCheck className="size-4 shrink-0 text-sky-400" aria-hidden="true" />
          <span>JUKWAA SALAMA</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6 font-display font-extrabold tracking-tight text-white"
          style={{
            fontSize: 'clamp(2.25rem, 6.2vw, 4.5rem)',
            lineHeight: 1.05,
            textWrap: 'balance',
          }}
        >
          WELCOME TO{' '}
          <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-white bg-clip-text text-transparent">
            ADSCENTER
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-5 max-w-2xl text-sm leading-relaxed text-blue-100/80 sm:text-lg"
        >
          Tazama video za wafanyabiashara waliothibitishwa; mapato yako yanaongezeka kadri
          unavyotazama video na unaweza kufuatilia kila muamala kwenye dashboard ya kisasa.
        </motion.p>

        {/* Primary Entry CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-8 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleStart}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#155EEF] to-[#2563EB] px-8 py-4 font-display text-base font-extrabold tracking-wide text-white shadow-2xl shadow-blue-600/35 ring-1 ring-sky-300/30 transition hover:from-[#1D6BFF] hover:to-[#3B82F6] sm:w-auto"
          >
            <span>Anza Sasa · Ingia Dashboard</span>
            <ArrowRight className="size-5" aria-hidden="true" />
          </motion.button>
        </motion.div>

        {/* Modern 3-Card Bento Feature Strip */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.32 }}
          className="mt-12 grid w-full gap-4 text-left sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/10 bg-[#0A1B3B]/80 p-5 backdrop-blur-md">
            <div className="grid size-10 place-items-center rounded-xl bg-[#155EEF]/20 text-sky-300 ring-1 ring-sky-400/25">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-base font-bold text-white">
              Zaidi ya Video 7,000+
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-blue-100/75 sm:text-sm">
              Zaidi ya video 7,000+ za wafanyabiashara zipo kwenye jukwaa hili — chagua unayoipenda
              na uitazame hadi sekunde zikamilike.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A1B3B]/80 p-5 backdrop-blur-md">
            <div className="grid size-10 place-items-center rounded-xl bg-[#155EEF]/20 text-sky-300 ring-1 ring-sky-400/25">
              <TrendingUp className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-base font-bold text-white">
              Mapato ya Uwazi
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-blue-100/75 sm:text-sm">
              Mapato yanaongezeka kadri unavyotazama video.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A1B3B]/80 p-5 backdrop-blur-md">
            <div className="grid size-10 place-items-center rounded-xl bg-[#155EEF]/20 text-sky-300 ring-1 ring-sky-400/25">
              <Wallet className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-base font-bold text-white">
              Jukwaa Salama & Haraka
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-blue-100/75 sm:text-sm">
              Fuatilia Net Profit, Balance, na Toa Pesa moja kwa moja kwenye kifaa chako.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quiet Bottom Signature */}
      <footer className="relative z-10 mx-auto w-full max-w-[1200px] px-5 pb-6 text-center text-xs text-blue-200/55 sm:px-8">
        <span>AdsCenter · Jukwaa Salama · Watch. Earn. Repeat.</span>
      </footer>
    </motion.section>
  );
}
