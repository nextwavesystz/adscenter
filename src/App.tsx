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
  TrendingUp,
  Wallet,
  WifiOff,
} from 'lucide-react';
import { motion, MotionConfig } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { InstallAppModal } from './components/InstallAppModal';
import { PayoutToast } from './components/PayoutToast';
import { SupportContactModal } from './components/SupportContactModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
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
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );
}

export default function App() {
  const { profit, balance, watchedIds, withdrawHistory, creditReward, recordWithdrawAttempt } =
    useWallet();

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

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#F4F6F9] text-slate-900">
        {/* Top Bar Contract: 3 zones (Brand wordmark — 4 single-line links — 1 primary CTA) */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-4 sm:px-6">
            <a
              href="#top"
              className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 transition active:scale-95"
            >
              <span className="grid size-8 place-items-center rounded-[10px] bg-[#0B1220] text-emerald-400">
                <Play className="size-4 fill-current" aria-hidden="true" />
              </span>
              <span>AdsCenter</span>
            </a>

            <nav
              aria-label="Navigeshani kuu"
              className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"
            >
              <a
                href="#tasks"
                className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
              >
                Video Tasks
              </a>
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
              >
                Toa Pesa
              </button>
              <button
                type="button"
                onClick={() => setInstallOpen(true)}
                className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
              >
                Download App
              </button>
              <button
                type="button"
                onClick={() => handleOpenSupport(null)}
                className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
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
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-700 whitespace-nowrap shrink-0 sm:text-sm"
              >
                <span>Fungua Account</span>
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </motion.a>
            </div>
          </div>
        </header>

        <main id="top">
          {/* Modern Architectural Dashboard & Hero */}
          <section className="mx-auto max-w-[1200px] px-4 pt-6 pb-8 sm:px-6 lg:pt-10">
            <div className="grid items-stretch gap-6 lg:grid-cols-12">
              {/* Left: Modern Obsidian Command Dashboard */}
              <div className="flex flex-col justify-between rounded-[28px] bg-[#0B1220] p-5 text-white shadow-xl sm:p-7 lg:col-span-7">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 pb-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-400">
                        AdsCenter · Watch. Earn. Repeat.
                      </p>
                      <h1
                        className="mt-1 font-display font-extrabold tracking-tight text-white"
                        style={{
                          fontSize: 'clamp(1.65rem, 3vw, 2.35rem)',
                          lineHeight: 1.15,
                          textWrap: 'balance',
                        }}
                      >
                        AdsCenter Dashboard
                      </h1>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-medium text-slate-400">Video za Leo</p>
                      <p className="font-mono text-sm font-bold text-slate-200 tabular-nums">
                        {watchedIds.length} / {VIDEO_TASKS.length} ({completionPercent}%)
                      </p>
                    </div>
                  </div>

                  {/* Primary Metric Cards */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {/* Net Profit Card */}
                    <article className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-5 text-white">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-emerald-100">Net Profit</p>
                        <TrendingUp className="size-5 text-emerald-200" aria-hidden="true" />
                      </div>
                      <p className="mt-4 font-mono text-3xl font-bold tracking-tight tabular-nums">
                        <AnimatedTsh value={profit} />
                      </p>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <p className="text-xs text-emerald-100">
                          {lastEarnedTsh
                            ? `+${formatTsh(lastEarnedTsh)} imeongezwa`
                            : 'Mapato ya mwezi huu'}
                        </p>
                        <svg
                          viewBox="0 0 80 24"
                          className="h-5 w-16 text-emerald-200/90"
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

                    {/* Balance Card */}
                    <article className="flex flex-col justify-between rounded-[22px] border border-slate-700/80 bg-slate-900/90 p-5 text-white">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-300">Balance Iliyopo</p>
                        <Wallet className="size-5 text-orange-400" aria-hidden="true" />
                      </div>
                      <p className="mt-4 font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
                        <AnimatedTsh value={balance} />
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => setWithdrawOpen(true)}
                        className="mt-4 flex min-h-10 w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-300"
                      >
                        Toa pesa
                      </motion.button>
                    </article>
                  </div>

                  {/* Progress Track */}
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Kazi za video zilizokamilika</span>
                      <span className="font-mono font-semibold text-slate-200 tabular-nums">
                        {watchedIds.length} kati ya {VIDEO_TASKS.length}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-[width] duration-300"
                        style={{ width: `${Math.max(4, completionPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Strip + Account Protection Banner */}
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setHistoryOpen(true)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 sm:text-sm"
                    >
                      <History className="size-4 text-emerald-400" aria-hidden="true" />
                      <span>Withdraw history</span>
                      {withdrawHistory.length > 0 && (
                        <span className="font-mono text-xs text-slate-300 tabular-nums">
                          ({withdrawHistory.length})
                        </span>
                      )}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setInstallOpen(true)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 sm:text-sm"
                    >
                      <Download className="size-4 text-orange-400" aria-hidden="true" />
                      <span>Download App</span>
                    </motion.button>
                  </div>

                  <div className="rounded-[22px] border border-slate-700/80 bg-slate-900/90 p-4 sm:p-5">
                    <h2 className="font-display text-base font-bold leading-snug text-white sm:text-lg">
                      Tazama video za wafanyabiashara — ulipwe kulingana na muda uliotazama!
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
                      Kila video unayomaliza ni pesa mkononi. Fungua account yako sasa ili malipo
                      yako yasipotee.
                    </p>
                    <motion.a
                      whileTap={{ scale: 0.97 }}
                      href={REGISTER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3.5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-orange-500"
                    >
                      <span>Fungua account sasa</span>
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* Right: Editorial Hero Showcase */}
              <div className="lg:col-span-5">
                <div className="relative h-full min-h-[300px] overflow-hidden rounded-[28px] border border-slate-200 bg-slate-900 shadow-lg lg:min-h-[460px]">
                  {!heroImageError ? (
                    <img
                      src={HERO_IMAGE}
                      alt="Watumiaji wa AdsCenter wakitazama video za wafanyabiashara kwenye simu kupata malipo"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImageError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900 p-8 text-center text-white">
                      <p className="font-display text-2xl font-bold">
                        AdsCenter · Tazama na Ulipwe Leo
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="font-mono text-xs font-semibold text-emerald-300 tabular-nums">
                      AdsCenter · {VIDEO_TASKS.length} video · TSh 3,300 – 7,600 kwa video
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold leading-snug">
                      Malipo ya papo hapo ukimaliza kutazama video yoyote.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <motion.a
                        whileTap={{ scale: 0.96 }}
                        href="#tasks"
                        className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-slate-100"
                      >
                        <Play
                          className="size-3.5 fill-current text-emerald-600"
                          aria-hidden="true"
                        />
                        <span>Tazama Sasa</span>
                      </motion.a>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => handleOpenSupport(null)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/25 bg-slate-950/50 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-slate-950/75"
                      >
                        <Headset className="size-3.5 text-emerald-400" aria-hidden="true" />
                        <span>Huduma kwa Wateja</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Strip */}
          <section className="border-y border-slate-200 bg-white py-8">
            <div className="mx-auto grid max-w-[1200px] gap-6 px-4 sm:px-6 md:grid-cols-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  01. Bonyeza Play kwenye Video
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Chagua video ya bidhaa unayoipenda hapa chini na uitazame hadi sekunde ziishe.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  02. Kusanya TSh kwenye Balance
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Kila video iliyokamilika inaongeza malipo yako moja kwa moja kwenye Net Profit na
                  Balance.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  03. Fungua Account na Toa Pesa
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Sajili namba yako kupitia Fungua account sasa ili upokee miamala yako ya Toa pesa.
                </p>
              </div>
            </div>
          </section>

          {/* Videos to Watch Today (All 77 Real Videos) */}
          <section id="tasks" className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-12">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold text-emerald-700">Available tasks today</p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Videos to Watch Today
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
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
                    className="min-h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                  />
                </div>

                <p className="font-mono text-xs font-bold text-slate-700 tabular-nums whitespace-nowrap">
                  {filteredVideos.length} videos
                </p>
              </div>
            </div>

            {/* Fluid Native-OS Category Segmented Tabs */}
            <div
              role="tablist"
              aria-label="Chuja kwa aina ya bidhaa"
              className="no-scrollbar mt-5 flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-slate-200/70 p-1.5"
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
                      active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="category-indicator"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-slate-900 shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {filteredVideos.length === 0 ? (
              <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-10 text-center">
                <p className="font-display text-lg font-bold text-slate-900">
                  Hakuna video iliyolingana na utafutaji wako
                </p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Zote');
                    setSearchQuery('');
                  }}
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
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
                        whileHover={{ y: -2 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white transition-colors hover:border-slate-300"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                          <VideoCoverImage task={task} />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/35" />

                          <div className="absolute inset-x-3 top-3 flex items-center justify-between text-xs font-bold text-white">
                            <span className="rounded-lg bg-slate-950/80 px-2 py-1 font-mono tabular-nums backdrop-blur-md">
                              #{String(task.id).padStart(2, '0')}
                            </span>
                            <span className="flex items-center gap-1 rounded-lg bg-slate-950/80 px-2 py-1 font-mono tabular-nums backdrop-blur-md">
                              <Clock3 className="size-3.5" aria-hidden="true" />
                              {formatSeconds(task.durationSeconds)}
                            </span>
                          </div>

                          {isWatched && (
                            <div className="absolute bottom-3 left-3">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
                                <CheckCircle2 className="size-3" aria-hidden="true" />
                                <span>Imetazamwa</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                                {task.category}
                              </p>
                              <h3 className="mt-1 font-display text-lg font-bold leading-tight text-slate-900">
                                {task.title}
                              </h3>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-[11px] text-slate-500">Reward</p>
                              <p className="mt-0.5 font-mono text-sm font-bold text-emerald-700 tabular-nums">
                                {formatTsh(task.rewardTsh)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2.5">
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              type="button"
                              onClick={() => handlePlayVideo(task)}
                              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 whitespace-nowrap"
                            >
                              <Play className="size-3.5 fill-current" aria-hidden="true" />
                              <span>{isWatched ? 'Play Tena' : 'Play'}</span>
                            </motion.button>

                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              type="button"
                              onClick={() => handleOpenSupport(task.title)}
                              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100 whitespace-nowrap"
                            >
                              <ShoppingBag className="size-3.5" aria-hidden="true" />
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
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                    >
                      Onyesha Video Zaidi ({filteredVideos.length - visibleCount} zimebaki)
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setVisibleCount(filteredVideos.length)}
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
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
        <footer className="border-t border-slate-200 bg-white py-8">
          <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6">
            <div>
              <span className="font-display text-sm font-bold text-slate-900">AdsCenter</span>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              <span>Watch. Earn. Repeat.</span>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <a href="#tasks" className="hover:text-slate-900">
                Video Tasks
              </a>
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="hover:text-slate-900"
              >
                Toa Pesa
              </button>
              <button
                type="button"
                onClick={() => setInstallOpen(true)}
                className="hover:text-slate-900"
              >
                Download App
              </button>
              <button
                type="button"
                onClick={() => handleOpenSupport(null)}
                className="hover:text-slate-900"
              >
                Huduma kwa Wateja
              </button>
              <a
                href={REGISTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-orange-600 hover:underline"
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
          className="fixed bottom-4 right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl transition hover:bg-orange-700 sm:bottom-6 sm:right-6"
        >
          <Headset className="size-4" aria-hidden="true" />
          <span className="whitespace-nowrap">Huduma kwa wateja</span>
        </motion.button>

        {/* Top Live Payout Notifications with Signature Chime */}
        <PayoutToast />

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
      </div>
    </MotionConfig>
  );
}
