import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  Headset,
  History,
  Play,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Volume2,
  Wallet,
  WifiOff,
} from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { InstallAppModal } from './components/InstallAppModal';
import { PayoutToast } from './components/PayoutToast';
import { SpotlightVoiceGuide } from './components/SpotlightVoiceGuide';
import { SupportContactModal } from './components/SupportContactModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WithdrawHistoryModal, WithdrawModal } from './components/WithdrawModals';
import { formatSeconds, formatTsh, HERO_IMAGE, REGISTER_URL } from './constants/config';
import { VIDEO_CATEGORIES, VIDEO_TASKS, type VideoCategory, type VideoTask } from './data/videos';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import { useWallet } from './hooks/useWallet';
import { unlockAudio } from './utils/sound';

const INITIAL_VISIBLE_COUNT = 18;

function AnimatedTsh({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 650;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        prevRef.current = end;
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      prevRef.current = end;
    };
  }, [value]);

  return <>{formatTsh(displayValue)}</>;
}

function VideoCoverImage({ task }: { task: VideoTask }) {
  const [src, setSrc] = useState(task.coverUrl);

  useEffect(() => {
    setSrc(task.coverUrl);
  }, [task.coverUrl]);

  return (
    <img
      src={src}
      alt={task.title}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (src !== task.fallbackImage) {
          setSrc(task.fallbackImage);
        }
      }}
      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
    />
  );
}

export default function App() {
  const { profit, balance, watchedIds, withdrawHistory, creditReward, recordWithdrawAttempt } =
    useWallet();

  const [showWelcome, setShowWelcome] = useState(true);
  const [tourActive, setTourActive] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'Zote' | VideoCategory>('Zote');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [activeVideo, setActiveVideo] = useState<VideoTask | null>(null);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportProductTitle, setSupportProductTitle] = useState<string | null>(null);
  const [heroImageError, setHeroImageError] = useState(false);
  const [lastEarnedTsh, setLastEarnedTsh] = useState<number | null>(null);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [selectedCategory, searchQuery]);

  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return VIDEO_TASKS.filter((task) => {
      const matchesCategory = selectedCategory === 'Zote' || task.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        task.title.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q) ||
        String(task.id).includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const displayedVideos = useMemo(
    () => filteredVideos.slice(0, visibleCount),
    [filteredVideos, visibleCount],
  );

  const handleOpenSupport = (productTitle: string | null = null) => {
    unlockAudio();
    setSupportProductTitle(productTitle);
    setSupportOpen(true);
  };

  const handlePlayVideo = (task: VideoTask) => {
    unlockAudio();
    setActiveVideo(task);
  };

  const handleVideoCompleted = (id: number, amount: number) => {
    creditReward(id, amount);
    setLastEarnedTsh(amount);
    window.setTimeout(() => {
      setLastEarnedTsh((curr) => (curr === amount ? null : curr));
    }, 5000);
  };

  const handleNextVideo = (currentId: number) => {
    const unwatched = VIDEO_TASKS.find((v) => v.id !== currentId && !watchedIds.includes(v.id));
    if (unwatched) {
      setActiveVideo(unwatched);
      return;
    }
    const idx = VIDEO_TASKS.findIndex((v) => v.id === currentId);
    const next = VIDEO_TASKS[(idx + 1) % VIDEO_TASKS.length];
    setActiveVideo(next);
  };

  const completionPercent = Math.round((watchedIds.length / VIDEO_TASKS.length) * 100);
  const progressBarWidth = completionPercent === 0 ? 0 : Math.max(4, completionPercent);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <WelcomeScreen
            key="welcome-screen"
            onEnter={() => {
              setShowWelcome(false);
              if (tourActive && tourStep === 0) {
                setTourStep(1);
              }
            }}
            onReplayGuide={() => {
              setTourStep(0);
              setTourActive(true);
            }}
          />
        ) : (
          <motion.div
            key="dashboard-shell"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="min-h-screen bg-[#F4F7FC] text-[#0A192F]"
          >
            {/* Top Bar Contract: 3 zones (Brand wordmark — 4 single-line links — 1 primary CTA) */}
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050E1F]/90 text-white backdrop-blur-xl">
              <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6">
                <a
                  href="#top"
                  className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 transition active:scale-95"
                >
                  <span className="grid size-8 place-items-center rounded-[10px] bg-gradient-to-br from-[#155EEF] to-[#0B3B9E] text-sky-300 ring-1 ring-sky-300/30">
                    <Play className="size-4 fill-current" aria-hidden="true" />
                  </span>
                  <span>AdsCenter</span>
                </a>

                <nav
                  aria-label="Navigeshani kuu"
                  className="hidden items-center gap-7 text-sm font-medium text-blue-100/80 md:flex"
                >
                  <a
                    href="#tasks"
                    className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
                  >
                    Video Tasks
                  </a>
                  <button
                    type="button"
                    onClick={() => setWithdrawOpen(true)}
                    className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
                  >
                    Toa Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstallOpen(true)}
                    className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
                  >
                    Download App
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSupport(null)}
                    className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
                  >
                    Huduma
                  </button>
                </nav>

                <div className="flex items-center shrink-0">
                  <motion.a
                    whileTap={{ scale: 0.95 }}
                    href={REGISTER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#155EEF] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/25 ring-1 ring-sky-300/25 transition hover:bg-[#1D6BFF] whitespace-nowrap shrink-0 sm:text-sm"
                  >
                    <span>Fungua Account</span>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </motion.a>
                </div>
              </div>
            </header>

            <main id="top">
              {/* Atmospheric Deep Navy Hero & Bento Command Center */}
              <section className="relative overflow-hidden bg-[#050E1F] pt-6 pb-12 text-white sm:pt-9 sm:pb-14">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(ellipse 75% 60% at 25% 0%, rgba(21, 94, 239, 0.32), transparent 70%), radial-gradient(circle at 90% 90%, rgba(56, 189, 248, 0.14), transparent 50%)',
                  }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
                    backgroundSize: '44px 44px',
                  }}
                />

                <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6">
                  {/* Top Greeting Header Row */}
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-sky-300 sm:text-sm">
                        AdsCenter. Watch. Earn. Repeat.
                      </p>
                      <h1
                        className="mt-1.5 font-display font-extrabold tracking-tight text-white"
                        style={{
                          fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                          lineHeight: 1.1,
                          textWrap: 'balance',
                        }}
                      >
                        AdsCenter Dashboard
                      </h1>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 backdrop-blur-md">
                      <div className="text-right">
                        <p className="text-[11px] font-medium text-blue-200/75">Video za Leo</p>
                        <p className="font-mono text-sm font-bold text-white tabular-nums">
                          {watchedIds.length} / {VIDEO_TASKS.length} ({completionPercent}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Bento Grid */}
                  <div className="grid items-stretch gap-5 lg:grid-cols-12">
                    {/* Left: Glassmorphic Wallet & Actions Bento */}
                    <div className="flex flex-col justify-between gap-4 lg:col-span-7">
                      {/* Dual Metric Tiles */}
                      <div data-tour="dashboard-wallet" className="grid gap-4 sm:grid-cols-2">
                        {/* Net Profit */}
                        <article className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#155EEF] via-[#1347C2] to-[#0A2D82] p-5 text-white shadow-xl shadow-blue-950/50 ring-1 ring-sky-300/25">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold tracking-wide text-blue-100/90 uppercase">
                              Net Profit
                            </p>
                            <span className="grid size-8 place-items-center rounded-xl bg-white/15 text-sky-200">
                              <TrendingUp className="size-4" aria-hidden="true" />
                            </span>
                          </div>
                          <p className="mt-4 font-mono text-3xl font-bold tracking-tight text-white tabular-nums sm:text-[2rem]">
                            <AnimatedTsh value={profit} />
                          </p>
                          <div className="mt-3 flex items-end justify-between gap-2">
                            <p className="text-xs text-blue-100/90">
                              {lastEarnedTsh
                                ? `+${formatTsh(lastEarnedTsh)} imeongezwa`
                                : profit === 0
                                  ? 'Tazama video uanze kupata mapato'
                                  : 'Jumla ya mapato uliyokusanya'}
                            </p>
                            <svg
                              viewBox="0 0 80 24"
                              className="h-5 w-16 shrink-0 text-sky-200/85"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M2 20 L18 14 L32 16 L48 8 L64 10 L78 2"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </article>

                        {/* Balance Iliyopo */}
                        <article className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#0B1B3A]/90 p-5 text-white backdrop-blur-xl">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold tracking-wide text-blue-200/85 uppercase">
                              Balance Iliyopo
                            </p>
                            <span className="grid size-8 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
                              <Wallet className="size-4" aria-hidden="true" />
                            </span>
                          </div>
                          <p className="mt-4 font-mono text-3xl font-bold tracking-tight text-white tabular-nums sm:text-[2rem]">
                            <AnimatedTsh value={balance} />
                          </p>
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            onClick={() => setWithdrawOpen(true)}
                            className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-xs font-extrabold text-[#050E1F] transition hover:bg-sky-300"
                          >
                            Toa pesa
                          </motion.button>
                        </article>
                      </div>

                      {/* Progress + Quick Action Buttons */}
                      <div className="rounded-[24px] border border-white/10 bg-[#0B1B3A]/85 p-4 backdrop-blur-xl sm:p-5">
                        <div className="flex items-center justify-between text-xs text-blue-200/80">
                          <span>Maendeleo ya kazi za leo</span>
                          <span className="font-mono font-semibold text-white tabular-nums">
                            {watchedIds.length} kati ya {VIDEO_TASKS.length}
                          </span>
                        </div>
                        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-400 transition-[width] duration-500 ease-out"
                            style={{ width: `${progressBarWidth}%` }}
                          />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => setHistoryOpen(true)}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/[0.12] sm:text-sm"
                          >
                            <History className="size-4 text-sky-300" aria-hidden="true" />
                            <span>Withdraw history</span>
                            {withdrawHistory.length > 0 && (
                              <span className="font-mono text-xs text-sky-300 tabular-nums">
                                ({withdrawHistory.length})
                              </span>
                            )}
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => setInstallOpen(true)}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/[0.12] sm:text-sm"
                          >
                            <Download className="size-4 text-sky-300" aria-hidden="true" />
                            <span>Download App</span>
                          </motion.button>
                        </div>
                      </div>

                      {/* Account Protection Callout */}
                      <div
                        data-tour="dashboard-payout"
                        className="flex flex-col justify-between gap-4 rounded-[24px] border border-sky-400/20 bg-gradient-to-r from-[#0C2147] to-[#0A1A38] p-5 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0">
                          <h2 className="font-display text-base font-bold leading-snug text-white">
                            Tazama video za wafanyabiashara — ulipwe kulingana na muda uliotazama!
                          </h2>
                          <p className="mt-1 text-xs leading-relaxed text-blue-100/80">
                            Kila video unayomaliza ni pesa mkononi. Fungua account sasa ili malipo
                            yako yasipotee.
                          </p>
                        </div>

                        <motion.a
                          whileTap={{ scale: 0.97 }}
                          href={REGISTER_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#155EEF] px-5 py-3 font-display text-xs font-extrabold uppercase tracking-wide text-white shadow-lg shadow-blue-950/40 ring-1 ring-sky-300/25 transition hover:bg-[#1D6BFF]"
                        >
                          <span>Fungua account</span>
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        </motion.a>
                      </div>
                    </div>

                    {/* Right: Editorial Hero Showcase */}
                    <div className="lg:col-span-5">
                      <div className="relative h-full min-h-[320px] overflow-hidden rounded-[26px] border border-white/12 bg-[#0A1931] shadow-2xl shadow-blue-950/50 lg:min-h-[440px]">
                        {!heroImageError ? (
                          <img
                            src={HERO_IMAGE}
                            alt="Watumiaji wa AdsCenter wakitazama video za wafanyabiashara kwenye simu kupata malipo"
                            referrerPolicy="no-referrer"
                            onError={() => setHeroImageError(true)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#0A1931] p-8 text-center text-white">
                            <p className="font-display text-2xl font-bold">
                              AdsCenter · Tazama na Ulipwe Leo
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050E1F]/95 via-[#07152F]/45 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                          <p className="font-mono text-xs font-semibold text-sky-300 tabular-nums">
                            {VIDEO_TASKS.length} video · TSh 3,300 – 7,600 kwa video
                          </p>
                          <p className="mt-2 font-display text-2xl font-bold leading-snug">
                            Malipo ya papo hapo ukimaliza kutazama video yoyote.
                          </p>
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <motion.a
                              whileTap={{ scale: 0.96 }}
                              href="#tasks"
                              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-[#050E1F] transition hover:bg-blue-50"
                            >
                              <Play
                                className="size-3.5 fill-current text-[#155EEF]"
                                aria-hidden="true"
                              />
                              <span>Tazama Sasa</span>
                            </motion.a>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              type="button"
                              onClick={() => handleOpenSupport(null)}
                              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/20 bg-[#050E1F]/65 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-[#0D2147]"
                            >
                              <Headset className="size-3.5 text-sky-300" aria-hidden="true" />
                              <span>Huduma kwa Wateja</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Integrated Sleek 3-Step Bento Strip */}
                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#155EEF]/25 font-mono text-xs font-bold text-sky-300">
                        01
                      </span>
                      <div>
                        <h2 className="font-display text-sm font-bold text-white">
                          Bonyeza Play kwenye Video
                        </h2>
                        <p className="mt-0.5 text-xs leading-relaxed text-blue-100/75">
                          Chagua video ya bidhaa unayoipenda hapa chini na uitazame hadi sekunde
                          ziishe.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#155EEF]/25 font-mono text-xs font-bold text-sky-300">
                        02
                      </span>
                      <div>
                        <h2 className="font-display text-sm font-bold text-white">
                          Kusanya TSh kuanzia Sifuri
                        </h2>
                        <p className="mt-0.5 text-xs leading-relaxed text-blue-100/75">
                          Kila video iliyokamilika inaongeza malipo yako moja kwa moja kwenye Net
                          Profit na Balance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#155EEF]/25 font-mono text-xs font-bold text-sky-300">
                        03
                      </span>
                      <div>
                        <h2 className="font-display text-sm font-bold text-white">
                          Fungua Account na Toa Pesa
                        </h2>
                        <p className="mt-0.5 text-xs leading-relaxed text-blue-100/75">
                          Sajili namba yako kupitia Fungua account sasa ili upokee miamala yako ya
                          Toa pesa.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Videos to Watch Today (All 77 Real Videos) */}
              <section id="tasks" className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-12">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                  <div>
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#155EEF] uppercase">
                      <Sparkles className="size-3.5" aria-hidden="true" />
                      <span>Available tasks today</span>
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#0A192F] sm:text-3xl">
                      Videos to Watch Today
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-68">
                      <Search
                        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tafuta bidhaa au namba..."
                        aria-label="Tafuta video za bidhaa"
                        className="min-h-11 w-full rounded-2xl border border-[#D5E0F0] bg-white pl-10 pr-3 text-sm text-[#0A192F] shadow-xs outline-none transition focus:border-[#155EEF] focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    <p className="font-mono text-xs font-bold text-[#142D55] tabular-nums whitespace-nowrap">
                      {filteredVideos.length} videos
                    </p>
                  </div>
                </div>

                {/* Fluid Native-OS Category Segmented Tabs */}
                <div
                  data-tour="dashboard-tasks"
                  role="tablist"
                  aria-label="Chuja kwa aina ya bidhaa"
                  className="no-scrollbar mt-5 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-[#DCE5F4] bg-white p-1.5 shadow-xs"
                >
                  {VIDEO_CATEGORIES.map((cat) => {
                    const active = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`relative min-h-9 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          active ? 'text-white' : 'text-[#1E3A63] hover:text-[#0A1931]'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="category-indicator"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            className="absolute inset-0 rounded-xl bg-[#0A1931] shadow-xs"
                          />
                        )}
                        <span className="relative z-10">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {filteredVideos.length === 0 ? (
                  <div className="mt-8 rounded-[24px] border border-[#D5E0F0] bg-white p-10 text-center shadow-xs">
                    <p className="font-display text-lg font-bold text-[#0A192F]">
                      Hakuna video iliyolingana na utafutaji wako
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => {
                        setSelectedCategory('Zote');
                        setSearchQuery('');
                      }}
                      className="mt-4 inline-flex min-h-10 items-center justify-center rounded-2xl bg-[#0A1931] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#132C57]"
                    >
                      Onyesha Video Zote ({VIDEO_TASKS.length})
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {displayedVideos.map((task) => {
                        const isWatched = watchedIds.includes(task.id);
                        return (
                          <motion.article
                            key={task.id}
                            whileHover={{ y: -3 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="group flex flex-col overflow-hidden rounded-[24px] border border-[#DCE5F4] bg-white shadow-xs transition-all hover:border-[#9AB3DA] hover:shadow-lg hover:shadow-blue-950/5"
                          >
                            <button
                              type="button"
                              onClick={() => handlePlayVideo(task)}
                              aria-label={`Tazama video ${task.title}`}
                              className="relative aspect-[16/9] w-full overflow-hidden bg-[#0A1931] text-left focus:outline-none"
                            >
                              <VideoCoverImage task={task} />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#050E1F]/80 via-transparent to-[#050E1F]/35" />

                              <div className="absolute inset-x-3 top-3 flex items-center justify-between text-xs font-bold text-white">
                                <span className="rounded-lg bg-[#050E1F]/80 px-2.5 py-1 font-mono tabular-nums backdrop-blur-md">
                                  #{String(task.id).padStart(2, '0')}
                                </span>
                                <span className="flex items-center gap-1 rounded-lg bg-[#050E1F]/80 px-2.5 py-1 font-mono tabular-nums backdrop-blur-md">
                                  <Clock3 className="size-3.5 text-sky-300" aria-hidden="true" />
                                  {formatSeconds(task.durationSeconds)}
                                </span>
                              </div>

                              <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <span className="grid size-12 place-items-center rounded-full bg-[#155EEF]/90 text-white shadow-xl ring-2 ring-white/40 backdrop-blur-sm">
                                  <Play className="size-5 translate-x-0.5 fill-current" />
                                </span>
                              </span>

                              {isWatched && (
                                <div className="absolute bottom-3 left-3">
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                                    <CheckCircle2 className="size-3" aria-hidden="true" />
                                    <span>Imetazamwa</span>
                                  </span>
                                </div>
                              )}
                            </button>

                            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold tracking-wider text-[#155EEF] uppercase">
                                    {task.category}
                                  </p>
                                  <h3 className="mt-1 font-display text-lg font-bold leading-tight text-[#0A192F]">
                                    {task.title}
                                  </h3>
                                </div>

                                <div className="shrink-0 rounded-xl bg-[#EEF3FA] px-2.5 py-1.5 text-right">
                                  <p className="text-[10px] font-medium text-slate-500 uppercase">
                                    Malipo
                                  </p>
                                  <p className="font-mono text-xs font-extrabold text-[#0A1931] tabular-nums sm:text-sm">
                                    {formatTsh(task.rewardTsh)}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-2.5">
                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  type="button"
                                  onClick={() => handlePlayVideo(task)}
                                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0A1931] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#155EEF] whitespace-nowrap"
                                >
                                  <Play
                                    className="size-3.5 fill-current text-sky-300"
                                    aria-hidden="true"
                                  />
                                  <span>{isWatched ? 'Play Tena' : 'Play'}</span>
                                </motion.button>

                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  type="button"
                                  onClick={() => handleOpenSupport(task.title)}
                                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#D5E0F0] bg-[#F8FAFD] px-3 py-2 text-xs font-semibold text-[#0A192F] transition hover:border-[#9AB3DA] hover:bg-[#E7EEF9] whitespace-nowrap"
                                >
                                  <ShoppingBag
                                    className="size-3.5 text-[#155EEF]"
                                    aria-hidden="true"
                                  />
                                  <span>Nunua / Buy</span>
                                </motion.button>
                              </div>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>

                    {visibleCount < filteredVideos.length && (
                      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() => setVisibleCount((c) => c + 18)}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#B9CCE6] bg-white px-6 py-2.5 text-sm font-bold text-[#0A192F] transition hover:bg-[#EEF3FA]"
                        >
                          Onyesha Video Zaidi ({filteredVideos.length - visibleCount} zimebaki)
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() => setVisibleCount(filteredVideos.length)}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#0A1931] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#155EEF]"
                        >
                          Fungua Zote ({filteredVideos.length})
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </main>

            {/* Quiet Footer */}
            <footer className="border-t border-[#DCE5F4] bg-white py-8">
              <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6">
                <div>
                  <span className="font-display text-sm font-bold text-[#0A192F]">AdsCenter</span>
                  <span className="mx-2" aria-hidden="true">
                    ·
                  </span>
                  <span>Jukwaa Salama · Watch. Earn. Repeat.</span>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <a href="#tasks" className="hover:text-[#0A1931]">
                    Video Tasks
                  </a>
                  <button
                    type="button"
                    onClick={() => setWithdrawOpen(true)}
                    className="hover:text-[#0A1931]"
                  >
                    Toa Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstallOpen(true)}
                    className="hover:text-[#0A1931]"
                  >
                    Download App
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSupport(null)}
                    className="hover:text-[#0A1931]"
                  >
                    Huduma kwa Wateja
                  </button>
                  <a
                    href={REGISTER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#155EEF] hover:underline"
                  >
                    Fungua Account
                  </a>
                </div>
              </div>
            </footer>

            {/* Floating Customer Support Trigger */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => handleOpenSupport(null)}
              aria-label="Huduma kwa wateja"
              className="fixed bottom-4 right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-sky-400/35 bg-[#0A1931] px-4 py-2.5 text-xs font-bold text-white shadow-xl shadow-blue-950/35 transition hover:bg-[#155EEF] sm:bottom-6 sm:right-6"
            >
              <Headset className="size-4 text-sky-300" aria-hidden="true" />
              <span className="whitespace-nowrap">Huduma kwa wateja</span>
            </motion.button>

            {/* Floating Voice Guide Replay Trigger (bottom-left) */}
            {isOnline && !tourActive && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  unlockAudio();
                  setTourStep(1);
                  setTourActive(true);
                }}
                aria-label="Fungua Mwongozo wa Sauti"
                className="fixed bottom-4 left-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-sky-400/30 bg-[#0A1931]/95 px-4 py-2.5 text-xs font-bold text-sky-200 shadow-xl shadow-blue-950/35 backdrop-blur-md transition hover:bg-[#155EEF] hover:text-white sm:bottom-6 sm:left-6"
              >
                <Volume2 className="size-4 text-sky-300" aria-hidden="true" />
                <span className="whitespace-nowrap">Mwongozo</span>
              </motion.button>
            )}

            {/* Non-intrusive Offline Mode Banner */}
            {!isOnline && (
              <div
                role="status"
                className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
              >
                <WifiOff className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Offline Mode — Data iliyohifadhiwa inatumika</span>
              </div>
            )}

            {/* Modals */}
            <VideoPlayerModal
              video={activeVideo}
              onClose={() => setActiveVideo(null)}
              onComplete={handleVideoCompleted}
              onBuyClick={(video) => handleOpenSupport(video.title)}
              onNextVideo={handleNextVideo}
            />

            <WithdrawModal
              open={withdrawOpen}
              balance={balance}
              onClose={() => setWithdrawOpen(false)}
              onRecordAttempt={recordWithdrawAttempt}
            />

            <WithdrawHistoryModal
              open={historyOpen}
              records={withdrawHistory}
              onClose={() => setHistoryOpen(false)}
            />

            <InstallAppModal
              open={installOpen}
              onClose={() => setInstallOpen(false)}
              isInstallable={isInstallable}
              isInstalled={isInstalled}
              isIOS={isIOS}
              onInstall={install}
            />

            <SupportContactModal
              open={supportOpen}
              onClose={() => setSupportOpen(false)}
              productTitle={supportProductTitle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Female Voice Spotlight Guide */}
      <SpotlightVoiceGuide
        active={tourActive}
        stepIndex={tourStep}
        currentScreen={showWelcome ? 'welcome' : 'dashboard'}
        onStepChange={setTourStep}
        onRequestDashboard={() => setShowWelcome(false)}
        onClose={() => setTourActive(false)}
      />

      {/* Top Live Payout Notifications (Active once inside the dashboard and after voice guide closes) */}
      <PayoutToast enabled={!showWelcome && !tourActive} />
    </MotionConfig>
  );
}
