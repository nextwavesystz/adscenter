import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  Loader2,
  Play,
  ShoppingBag,
  VolumeX,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatSeconds, formatTsh, REGISTER_URL } from '../constants/config';
import type { VideoTask } from '../data/videos';
import { playRewardChime, unlockAudio } from '../utils/sound';

interface VideoPlayerModalProps {
  video: VideoTask | null;
  onClose: () => void;
  onComplete: (videoId: number, rewardTsh: number) => void;
  onBuyClick: (video: VideoTask) => void;
  onNextVideo: (currentId: number) => void;
}

export function VideoPlayerModal({
  video,
  onClose,
  onComplete,
  onBuyClick,
  onNextVideo,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const maxTimeRef = useRef(0);
  const completedRef = useRef(false);
  const creditedRef = useRef(false);
  const verifyTimerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [phase, setPhase] = useState<'watching' | 'verifying' | 'completed'>('watching');
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsPlayClick, setNeedsPlayClick] = useState(false);
  const [isMutedBanner, setIsMutedBanner] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const creditOnce = useCallback((targetVideo: VideoTask) => {
    if (creditedRef.current) return;
    creditedRef.current = true;
    onCompleteRef.current(targetVideo.id, targetVideo.rewardTsh);
  }, []);

  const triggerCompletion = useCallback(
    (targetVideo: VideoTask) => {
      if (completedRef.current) return;
      completedRef.current = true;
      videoRef.current?.pause();
      setRemainingSeconds(0);
      setPhase('verifying');

      verifyTimerRef.current = window.setTimeout(() => {
        creditOnce(targetVideo);
        setPhase('completed');
        playRewardChime(false);
      }, 1400);
    },
    [creditOnce],
  );

  useEffect(() => {
    if (!video) return;

    if (verifyTimerRef.current !== null) {
      window.clearTimeout(verifyTimerRef.current);
      verifyTimerRef.current = null;
    }

    maxTimeRef.current = 0;
    completedRef.current = false;
    creditedRef.current = false;
    setRemainingSeconds(video.durationSeconds);
    setPhase('watching');
    setIsPlaying(false);
    setNeedsPlayClick(false);
    setIsMutedBanner(false);
    setVideoFailed(false);

    const el = videoRef.current;
    if (el) {
      unlockAudio();
      el.muted = false;
      el.currentTime = 0;
      el.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          el.muted = true;
          setIsMutedBanner(true);
          el.play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              setNeedsPlayClick(true);
            });
        });
    }

    return () => {
      if (verifyTimerRef.current !== null) {
        window.clearTimeout(verifyTimerRef.current);
        verifyTimerRef.current = null;
      }
      // Guarantee reward is credited if user already completed watch & closes during verification
      if (completedRef.current && !creditedRef.current) {
        creditOnce(video);
      }
    };
  }, [video, creditOnce]);

  // Smooth polling backup so progress & completion always fire reliably on all mobile browsers
  useEffect(() => {
    if (!video || videoFailed || phase !== 'watching') return;
    const poll = window.setInterval(() => {
      const el = videoRef.current;
      if (!el || el.paused) return;
      if (el.currentTime <= maxTimeRef.current + 1.5) {
        maxTimeRef.current = Math.max(maxTimeRef.current, el.currentTime);
      }
      const targetDur =
        el.duration && Number.isFinite(el.duration) && el.duration > 0
          ? Math.min(video.durationSeconds, el.duration)
          : video.durationSeconds;
      const watched = Math.min(maxTimeRef.current, targetDur);
      const left = Math.max(0, Math.ceil(targetDur - watched));
      setRemainingSeconds(left);

      if (el.currentTime >= targetDur - 0.2 || left === 0) {
        triggerCompletion(video);
      }
    }, 250);

    return () => window.clearInterval(poll);
  }, [video, videoFailed, phase, triggerCompletion]);

  // Fallback timer if external MP4 stream fails to load
  useEffect(() => {
    if (!video || !videoFailed || phase !== 'watching') return;
    const fallbackInterval = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(fallbackInterval);
          triggerCompletion(video);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(fallbackInterval);
  }, [video, videoFailed, phase, triggerCompletion]);

  const handleUnmute = () => {
    const el = videoRef.current;
    if (!el) return;
    unlockAudio();
    el.muted = false;
    setIsMutedBanner(false);
  };

  const handleManualPlay = () => {
    const el = videoRef.current;
    if (!el) return;
    unlockAudio();
    el.play().catch(() => {});
    setIsPlaying(true);
    setNeedsPlayClick(false);
  };

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || !video || phase !== 'watching') return;

    if (el.currentTime <= maxTimeRef.current + 1.5) {
      maxTimeRef.current = Math.max(maxTimeRef.current, el.currentTime);
    }
    const targetDur =
      el.duration && Number.isFinite(el.duration) && el.duration > 0
        ? Math.min(video.durationSeconds, el.duration)
        : video.durationSeconds;
    const watched = Math.min(maxTimeRef.current, targetDur);
    const left = Math.max(0, Math.ceil(targetDur - watched));
    setRemainingSeconds(left);

    if (el.currentTime >= targetDur - 0.2 || left === 0) {
      triggerCompletion(video);
    }
  };

  const handleSeeking = () => {
    const el = videoRef.current;
    if (!el || phase !== 'watching') return;
    if (el.currentTime > maxTimeRef.current + 1) {
      el.currentTime = maxTimeRef.current;
    }
  };

  const progressPct = video
    ? Math.min(
        100,
        ((video.durationSeconds - remainingSeconds) / Math.max(1, video.durationSeconds)) * 100,
      )
    : 0;

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.85 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-[#061124]/95 text-white backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label={`Tazama video: ${video.title}`}
        >
          <div className="mx-auto flex min-h-full max-w-4xl flex-col px-4 py-4 sm:px-6 sm:py-6">
            {/* Theater Header */}
            <div className="flex items-center justify-between gap-4 border-b border-[#1A335C] pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={onClose}
                  className="grid size-10 shrink-0 place-items-center rounded-2xl border border-[#1E3B70] bg-[#0B1F42] text-blue-100 transition hover:bg-[#132E5E] hover:text-white"
                  aria-label="Rudi kwenye dashboard"
                >
                  <ArrowLeft className="size-5" />
                </motion.button>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold text-white sm:text-lg">
                    {video.title}
                  </p>
                  <p className="truncate text-xs text-blue-200/75">
                    {video.category} · #{String(video.id).padStart(2, '0')} ·{' '}
                    {formatSeconds(video.durationSeconds)}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[11px] font-medium text-blue-200/75">Malipo</p>
                <p className="font-mono text-base font-bold text-sky-300 tabular-nums">
                  {formatTsh(video.rewardTsh)}
                </p>
              </div>
            </div>

            {/* Real Video Player Stage */}
            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#1E3B70] bg-black shadow-2xl">
              <div className="relative aspect-video w-full bg-black">
                {!videoFailed ? (
                  <video
                    ref={videoRef}
                    key={video.id}
                    src={video.videoUrl}
                    poster={video.coverUrl}
                    className="h-full w-full object-contain"
                    autoPlay
                    playsInline
                    preload="auto"
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    onSeeking={handleSeeking}
                    onPlay={() => {
                      unlockAudio();
                      setIsPlaying(true);
                      setNeedsPlayClick(false);
                    }}
                    onEnded={() => triggerCompletion(video)}
                    onError={() => setVideoFailed(true)}
                    aria-label={video.title}
                  />
                ) : (
                  <div className="relative h-full w-full overflow-hidden">
                    <img
                      src={video.fallbackImage}
                      alt={video.title}
                      className="animate-reel-pan h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-4 px-5">
                      <p className="font-display text-lg font-bold text-white">{video.title}</p>
                      <p className="text-xs text-slate-300">
                        Tangazo la Biashara · {video.category}
                      </p>
                    </div>
                  </div>
                )}

                {isMutedBanner && !videoFailed && (
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={handleUnmute}
                    className="absolute bottom-14 right-3 z-10 flex items-center gap-2 rounded-full bg-[#0A1931]/90 px-4 py-2 text-xs font-bold text-white shadow-lg ring-1 ring-sky-400/30 backdrop-blur-md transition hover:bg-[#13294E]"
                  >
                    <VolumeX className="size-4" aria-hidden="true" />
                    <span>Washa sauti</span>
                  </motion.button>
                )}

                {needsPlayClick && !isPlaying && !videoFailed && (
                  <button
                    type="button"
                    onClick={handleManualPlay}
                    aria-label="Cheza video"
                    className="absolute inset-0 z-10 grid place-items-center bg-[#061124]/65"
                  >
                    <span className="grid size-20 place-items-center rounded-full bg-[#155EEF] text-white shadow-2xl transition active:scale-95 hover:scale-105">
                      <Play className="size-9 fill-current" aria-hidden="true" />
                    </span>
                  </button>
                )}

                {(isPlaying || videoFailed || phase === 'completed') && (
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => onBuyClick(video)}
                    className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-sky-400 px-5 py-2 font-display text-sm font-extrabold uppercase text-[#061124] shadow-xl transition hover:bg-sky-300"
                  >
                    <ShoppingBag className="size-4" aria-hidden="true" />
                    <span className="whitespace-nowrap">Nunua / Buy</span>
                  </motion.button>
                )}
              </div>

              <div className="h-1.5 w-full bg-[#11264D]">
                <div
                  className="h-full bg-sky-400 transition-[width] duration-200"
                  style={{ width: `${phase === 'completed' ? 100 : progressPct}%` }}
                />
              </div>
            </div>

            {/* Reward Verification & Status Panel */}
            <div
              className="mt-4 rounded-[22px] border border-[#1E3B70] bg-[#0B1F42] p-5"
              aria-live="polite"
            >
              {phase === 'watching' && (
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#132E5E] text-sky-300">
                      <Clock3 className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-display text-base font-bold text-white">
                        Endelea kutazama ili kupata {formatTsh(video.rewardTsh)}
                      </p>
                      <p className="text-xs text-blue-200/75">
                        Malipo yataingizwa kwenye Balance yako mara tu video ikikamilika.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-[#244682] bg-[#061124] px-4 py-2.5 text-center">
                    <span className="block text-[11px] text-blue-200/75">Muda uliobaki</span>
                    <span className="font-mono text-lg font-bold text-sky-300 tabular-nums">
                      {formatSeconds(remainingSeconds)}
                    </span>
                  </div>
                </div>
              )}

              {phase === 'verifying' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 py-1"
                >
                  <Loader2
                    className="size-6 shrink-0 animate-spin text-sky-300"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-display text-base font-bold text-white">
                      Inathibitisha malipo yako...
                    </p>
                    <p className="text-xs text-blue-200/75">
                      Tafadhali subiri sekunde chache, {formatTsh(video.rewardTsh)} inaingizwa
                      kwenye akaunti yako.
                    </p>
                  </div>
                </motion.div>
              )}

              {phase === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/15 p-4">
                    <div className="flex items-center gap-3">
                      <BadgeCheck className="size-8 shrink-0 text-emerald-400" aria-hidden="true" />
                      <div>
                        <p className="font-display text-base font-bold text-emerald-300">
                          Hongera! Umepata +{formatTsh(video.rewardTsh)}
                        </p>
                        <p className="text-xs text-emerald-100/85">
                          Pesa imeongezwa kwenye Balance na Net Profit yako. Fungua akaunti sasa
                          ili malipo yako yasipotee.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <motion.a
                      whileTap={{ scale: 0.97 }}
                      href={REGISTER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#155EEF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1049C5]"
                    >
                      <span>Fungua Account Sasa</span>
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </motion.a>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => onNextVideo(video.id)}
                      className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#244682] bg-[#132E5E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#193B77]"
                    >
                      <span>Tazama Video Inayofuata</span>
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
