import { ArrowRight, Check, Loader2, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { unlockAudio } from '../utils/sound';

export interface TourCue {
  atSeconds: number;
  selector: string;
  hintLabel?: string;
}

export interface TourStep {
  id: string;
  selector: string;
  cues?: TourCue[];
  title: string;
  description: string;
  speechText: string;
  audioUrl: string;
  screen: 'welcome' | 'dashboard';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome-start',
    selector: '[data-tour="welcome-start"]',
    screen: 'welcome',
    title: 'Anza hapa',
    description:
      'Kuanza kuangalia video za wafanyabiashara kwenye jukwaa hili na kupokea pesa kwa kila video unayotazama au kununua bidhaa zao utakazo zipenda, bonyeza hapa.',
    speechText:
      'Karibu AdsCenter! Kuanza kuangalia video za wafanyabiashara kwenye jukwaa hili, na kupokea pesa kwa kila video unayotazama au kununua bidhaa zao utakazozipenda, bonyeza hapa.',
    audioUrl: '/audio/welcome-start.mp3',
  },
  {
    id: 'dashboard-wallet',
    selector: '[data-tour="dashboard-wallet"]',
    screen: 'dashboard',
    title: 'Fuatilia Mapato Yako',
    description:
      'Hapa kwenye Net Profit na Balance utaona salio lako likiongezeka papo hapo kila unapomaliza kutazama video ya mfanyabiashara.',
    speechText:
      'Hapa kwenye Net Profit na Balance, utaona pesa zako zikiongezeka papo hapo kila unapomaliza kutazama video moja hadi mwisho.',
    audioUrl: '/audio/dashboard-wallet.mp3',
  },
  {
    id: 'dashboard-tasks',
    selector: '[data-tour="dashboard-tasks"]',
    cues: [
      {
        atSeconds: 0,
        selector: '[data-tour="dashboard-tasks"]',
        hintLabel: 'Chagua video',
      },
      {
        atSeconds: 3.6,
        selector: '[data-tour="first-video-play"]',
        hintLabel: 'Bonyeza Play',
      },
      {
        atSeconds: 8.3,
        selector: '[data-tour="first-video-buy"]',
        hintLabel: 'Bonyeza Nunua / Buy',
      },
    ],
    screen: 'dashboard',
    title: 'Chagua na Tazama Video',
    description:
      'Chagua kundi au video unayoipenda hapa chini. Bonyeza Play kuitazama na ulipwe, au bonyeza Nunua kuwasiliana na muuzaji moja kwa moja.',
    speechText:
      'Chagua video ya mfanyabiashara unayoipenda hapa chini. Bonyeza Play kuitazama hadi sekunde ziishe upate malipo, au bonyeza Nunua kuwasiliana na muuzaji.',
    audioUrl: '/audio/dashboard-tasks.mp3',
  },
  {
    id: 'dashboard-payout',
    selector: '[data-tour="dashboard-withdraw"]',
    cues: [
      {
        atSeconds: 0,
        selector: '[data-tour="dashboard-withdraw"]',
        hintLabel: 'Bonyeza Toa pesa',
      },
      {
        atSeconds: 4.1,
        selector: '[data-tour="dashboard-payout"]',
        hintLabel: 'Fungua account sasa',
      },
    ],
    screen: 'dashboard',
    title: 'Fungua Account & Toa Pesa',
    description:
      'Ukishakusanya salio lako, bonyeza Toa pesa au Fungua account sasa ili kusajili namba yako na kupokea malipo yako kwa usalama.',
    speechText:
      'Na ukishakusanya salio lako, bonyeza Toa pesa au Fungua account sasa ili kusajili namba yako na kupokea malipo yako kwa usalama.',
    audioUrl: '/audio/dashboard-payout.mp3',
  },
];

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SpotlightVoiceGuideProps {
  active: boolean;
  stepIndex: number;
  currentScreen: 'welcome' | 'dashboard';
  onStepChange: (nextIndex: number) => void;
  onRequestDashboard: () => void;
  onClose: () => void;
}

const audioUrlCache = new Map<string, string>();
const inFlightRequests = new Map<string, Promise<string>>();

async function fetchStepVoiceUrl(targetStep: TourStep): Promise<string> {
  const cacheKey = targetStep.id;
  const cached = audioUrlCache.get(cacheKey);
  if (cached) return cached;

  const existing = inFlightRequests.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const staticRes = await fetch(targetStep.audioUrl);
      const contentType = staticRes.headers.get('content-type') || '';
      if (staticRes.ok && contentType.includes('audio')) {
        const blob = await staticRes.blob();
        if (blob.size > 1000) {
          const objectUrl = URL.createObjectURL(blob);
          audioUrlCache.set(cacheKey, objectUrl);
          return objectUrl;
        }
      }
    } catch {
      // Fall through to live server endpoint
    }

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: targetStep.speechText }),
    });

    if (!res.ok) {
      let message = 'Imeshindikana kupakia sauti ya mwongozo.';
      try {
        const errBody = (await res.json()) as { error?: string };
        if (errBody?.error) message = errBody.error;
      } catch {
        // Ignore parse error
      }
      throw new Error(message);
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    audioUrlCache.set(cacheKey, objectUrl);
    return objectUrl;
  })();

  inFlightRequests.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

function getCueIndexForTime(cues: TourCue[] | undefined, seconds: number): number {
  if (!cues || cues.length === 0) return 0;
  let matched = 0;
  for (let i = 0; i < cues.length; i += 1) {
    if (seconds >= cues[i].atSeconds) {
      matched = i;
    }
  }
  return matched;
}

export function SpotlightVoiceGuide({
  active,
  stepIndex,
  currentScreen,
  onStepChange,
  onRequestDashboard,
  onClose,
}: SpotlightVoiceGuideProps) {
  const step = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0];
  const [cueIndex, setCueIndex] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  });

  const [muted, setMuted] = useState(false);
  const [audioStatus, setAudioStatus] = useState<
    'idle' | 'loading' | 'playing' | 'needs-tap' | 'paused' | 'error'
  >('idle');
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTokenRef = useRef(0);

  const activeCue = step.cues?.[cueIndex];
  const activeSelector = activeCue?.selector ?? step.selector;

  const stopAudio = useCallback(() => {
    playTokenRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
  }, []);

  const attachAudioCueSync = useCallback((audio: HTMLAudioElement, targetStep: TourStep, token: number) => {
    const syncCue = () => {
      if (token !== playTokenRef.current) return;
      const nextCueIdx = getCueIndexForTime(targetStep.cues, audio.currentTime);
      setCueIndex((prev) => (prev === nextCueIdx ? prev : nextCueIdx));
    };

    audio.ontimeupdate = syncCue;
    audio.onended = () => {
      if (token === playTokenRef.current) {
        setAudioStatus('paused');
      }
    };
    audio.onerror = () => {
      if (token === playTokenRef.current) {
        setAudioStatus('error');
        setAudioError('Sauti imeshindwa kucheza.');
      }
    };
  }, []);

  const playStepVoice = useCallback(
    async (targetStep: TourStep) => {
      setCueIndex(0);

      if (muted) {
        stopAudio();
        setAudioStatus('paused');
        return;
      }

      stopAudio();
      const token = playTokenRef.current;
      setAudioError(null);
      setAudioStatus('loading');

      try {
        const url = await fetchStepVoiceUrl(targetStep);
        if (token !== playTokenRef.current) return;

        const audio = new Audio(url);
        audio.preload = 'auto';
        audioRef.current = audio;
        attachAudioCueSync(audio, targetStep, token);

        try {
          await audio.play();
          if (token === playTokenRef.current) {
            setAudioStatus('playing');
          }
        } catch {
          if (token === playTokenRef.current) {
            setAudioStatus('needs-tap');
          }
        }
      } catch (err) {
        if (token !== playTokenRef.current) return;
        const msg = err instanceof Error ? err.message : 'Hitilafu ya kupakia sauti.';
        setAudioError(msg);
        setAudioStatus('error');
      }
    },
    [muted, stopAudio, attachAudioCueSync],
  );

  // Trigger audio whenever step becomes active or changes, and prefetch next step
  useEffect(() => {
    setCueIndex(0);

    if (!active) {
      stopAudio();
      setAudioStatus('idle');
      return;
    }

    if (step.screen !== currentScreen) return;

    void playStepVoice(step);

    const nextStep = TOUR_STEPS[stepIndex + 1];
    if (nextStep) {
      void fetchStepVoiceUrl(nextStep).catch(() => {});
    }

    return () => {
      stopAudio();
    };
  }, [active, stepIndex, step, currentScreen, playStepVoice, stopAudio]);

  // Fallback cue progression if audio is muted so visual highlight still demonstrates Play & Nunua
  useEffect(() => {
    if (!active || step.screen !== currentScreen || !step.cues || step.cues.length <= 1) return;
    if (!muted) return;

    const timers = step.cues.slice(1).map((cue, idx) =>
      window.setTimeout(() => {
        setCueIndex(idx + 1);
      }, cue.atSeconds * 1000),
    );

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [active, muted, step, currentScreen]);

  // If autoplay was blocked on first load, unlock & play immediately on the user's first tap
  useEffect(() => {
    if (!active || audioStatus !== 'needs-tap' || muted) return;

    const handleFirstGesture = () => {
      unlockAudio();
      const existing = audioRef.current;
      if (existing) {
        existing
          .play()
          .then(() => setAudioStatus('playing'))
          .catch(() => {});
      } else {
        void playStepVoice(step);
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true, capture: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture, { capture: true });
    };
  }, [active, audioStatus, muted, playStepVoice, step]);

  // Measure active target selector & smoothly scroll / keep synchronized on cue transitions
  useEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }

    let cancelled = false;
    let scrollTimeout: number | undefined;
    let rafId = 0;

    const findTargetEl = () => {
      const cueEl = document.querySelector(activeSelector) as HTMLElement | null;
      if (cueEl) return cueEl;
      return document.querySelector(step.selector) as HTMLElement | null;
    };

    const measure = () => {
      if (cancelled) return;
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      const el = findTargetEl();
      if (!el) {
        setRect(null);
        return;
      }
      const box = el.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) return;

      const pad = 8;
      setRect({
        top: Math.max(4, box.top - pad),
        left: Math.max(4, box.left - pad),
        width: Math.min(window.innerWidth - 8, box.width + pad * 2),
        height: box.height + pad * 2,
      });
    };

    const locateAndScroll = () => {
      if (cancelled) return;
      const el = findTargetEl();
      if (!el) {
        rafId = window.requestAnimationFrame(locateAndScroll);
        return;
      }

      const box = el.getBoundingClientRect();
      const needsScroll = box.top < 72 || box.bottom > window.innerHeight - 230;
      if (needsScroll && step.screen === 'dashboard') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        scrollTimeout = window.setTimeout(measure, 360);
      }
      measure();
    };

    const delayMs = step.screen === 'dashboard' && cueIndex === 0 ? 220 : 20;
    const initDelay = window.setTimeout(locateAndScroll, delayMs);

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });

    const observer = new MutationObserver(measure);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      window.clearTimeout(initDelay);
      if (scrollTimeout) window.clearTimeout(scrollTimeout);
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [active, activeSelector, step.selector, step.screen, currentScreen, cueIndex]);

  const handleNext = () => {
    unlockAudio();
    if (stepIndex === 0 && currentScreen === 'welcome') {
      onRequestDashboard();
      onStepChange(1);
      return;
    }
    if (stepIndex < TOUR_STEPS.length - 1) {
      onStepChange(stepIndex + 1);
    } else {
      stopAudio();
      onClose();
    }
  };

  const handleSkip = () => {
    stopAudio();
    onClose();
  };

  const handleToggleMute = () => {
    unlockAudio();
    if (!muted) {
      setMuted(true);
      stopAudio();
      setAudioStatus('paused');
    } else {
      setMuted(false);
      setTimeout(() => {
        void playStepVoice(step);
      }, 20);
    }
  };

  const handleManualPlay = () => {
    unlockAudio();
    setMuted(false);
    const existing = audioRef.current;
    if (existing && audioStatus === 'needs-tap') {
      existing
        .play()
        .then(() => setAudioStatus('playing'))
        .catch(() => void playStepVoice(step));
      return;
    }
    void playStepVoice(step);
  };

  // Decide card placement (top vs bottom) so it never covers the highlighted element
  const placeCardAtTop =
    rect !== null &&
    rect.top > 280 &&
    rect.top + rect.height > viewport.height * 0.54;

  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      {active && (
        <div
          className="fixed inset-0 z-[80] pointer-events-none"
          aria-live="polite"
          role="dialog"
          aria-modal="true"
          aria-label={`Mwongozo hatua ${stepIndex + 1} kati ya ${TOUR_STEPS.length}`}
        >
          {/* Dimmed backdrop when target is still mounting */}
          {!rect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-auto fixed inset-0 bg-[#030916]/80 backdrop-blur-[2px]"
            />
          )}

          {/* Crisp Spotlight Cutout Ring (Animates smoothly between Category -> Play -> Buy) */}
          {rect && (
            <>
              <motion.div
                initial={false}
                animate={{
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="pointer-events-none fixed rounded-[20px] border-2 border-sky-400 shadow-[0_0_0_9999px_rgba(3,9,22,0.82),0_0_28px_rgba(56,189,248,0.5)]"
              />

              {/* Allow clicking the highlighted CTA directly on Step 1 */}
              {stepIndex === 0 && currentScreen === 'welcome' && (
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Anza Sasa · Ingia Dashboard"
                  style={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                  }}
                  className="pointer-events-auto fixed cursor-pointer rounded-[20px] bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                />
              )}
            </>
          )}

          {/* Modern Native-OS Mwongozo Card */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: placeCardAtTop ? -20 : 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placeCardAtTop ? -16 : 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.82 }}
            className={`pointer-events-auto fixed inset-x-0 mx-auto w-[calc(100%-1.5rem)] max-w-md rounded-[26px] border border-sky-400/25 bg-[#07142C]/96 p-5 text-white shadow-2xl shadow-blue-950/70 backdrop-blur-2xl ${
              placeCardAtTop ? 'top-4 sm:top-6' : 'bottom-4 sm:bottom-6'
            }`}
          >
            {/* Header Row: Step Counter + Live Cue Indicator + Voice Control + Ruka */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex shrink-0 items-center rounded-lg border border-sky-400/30 bg-[#0D2B4E] px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-sky-300 uppercase">
                  MWONGOZO {stepIndex + 1}/{TOUR_STEPS.length}
                </span>
                {activeCue?.hintLabel && (
                  <span className="truncate rounded-lg bg-sky-400/15 px-2 py-1 text-[11px] font-bold text-sky-200">
                    {activeCue.hintLabel}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {audioStatus === 'needs-tap' || audioStatus === 'paused' ? (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={handleManualPlay}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-sky-400/35 bg-sky-400/15 px-2.5 py-1 text-[11px] font-bold text-sky-200 transition hover:bg-sky-400/25"
                  >
                    <Volume2 className="size-3.5 text-sky-300" aria-hidden="true" />
                    <span>{audioStatus === 'needs-tap' ? 'Sikiliza Sauti' : 'Rudia Sauti'}</span>
                  </motion.button>
                ) : audioStatus === 'loading' ? (
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-blue-200/80">
                    <Loader2 className="size-3.5 animate-spin text-sky-300" aria-hidden="true" />
                    <span>Inaandaa sauti...</span>
                  </span>
                ) : audioStatus === 'playing' ? (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={handleToggleMute}
                    aria-label="Zima sauti"
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-400/15 px-2.5 py-1 text-[11px] font-bold text-sky-200 transition hover:bg-sky-400/25"
                  >
                    <Volume2 className="size-3.5 text-sky-300" aria-hidden="true" />
                    <span>Inaongea</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={handleToggleMute}
                    aria-label={muted ? 'Washa sauti' : 'Zima sauti'}
                    className="grid size-8 place-items-center rounded-lg bg-white/5 text-blue-200/80 transition hover:bg-white/10"
                  >
                    {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                  </motion.button>
                )}

                <button
                  type="button"
                  onClick={handleSkip}
                  className="min-h-8 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-200/75 transition hover:bg-white/10 hover:text-white"
                >
                  Ruka
                </button>
              </div>
            </div>

            {/* Step Title & Instructions */}
            <h2 className="mt-3 font-display text-xl font-extrabold tracking-tight text-white">
              {step.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-blue-100/85">{step.description}</p>

            {audioStatus === 'error' && audioError && (
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <span className="min-w-0 truncate">{audioError}</span>
                <button
                  type="button"
                  onClick={handleManualPlay}
                  className="inline-flex shrink-0 items-center gap-1 font-bold text-sky-300 hover:underline"
                >
                  <RotateCcw className="size-3" />
                  <span>Jaribu tena</span>
                </button>
              </div>
            )}

            {/* Bottom Progress Dots + Endelea CTA */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5" aria-label="Hatua za mwongozo">
                {TOUR_STEPS.map((s, idx) => {
                  const isCurrent = idx === stepIndex;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Hatua ${idx + 1}`}
                      onClick={() => {
                        unlockAudio();
                        if (s.screen === 'dashboard' && currentScreen === 'welcome') {
                          onRequestDashboard();
                        }
                        if (s.screen === 'welcome' && currentScreen === 'dashboard') {
                          return;
                        }
                        onStepChange(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCurrent ? 'w-6 bg-sky-400' : 'w-1.5 bg-white/25 hover:bg-white/45'
                      }`}
                    />
                  );
                })}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleNext}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-sky-400 px-5 py-2.5 font-display text-sm font-extrabold text-[#050E1F] shadow-lg shadow-sky-500/20 transition hover:bg-sky-300"
              >
                <span>{isLastStep ? 'Maliza' : 'Endelea'}</span>
                {isLastStep ? (
                  <Check className="size-4 stroke-[2.6]" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-4 stroke-[2.5]" aria-hidden="true" />
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
