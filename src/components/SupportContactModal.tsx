import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Loader2,
  MessageCircle,
  MessageSquareText,
  Radio,
  RotateCcw,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildSmsHref,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DISPLAY,
  WHATSAPP_CHANNEL_URL,
} from '../constants/config';
import { unlockAudio } from '../utils/sound';

interface SupportContactModalProps {
  open: boolean;
  onClose: () => void;
  productTitle?: string | null;
}

type SupportOptionKey = 'whatsapp' | 'sms' | 'channel';

interface SupportGuideCue {
  atSeconds: number;
  option: SupportOptionKey | null;
  label: string;
}

const SUPPORT_GUIDE_AUDIO_URL = '/audio/support-guide.mp3';
const SUPPORT_GUIDE_SPEECH_TEXT =
  'Hapa kwenye Huduma kwa Wateja, una machaguo matatu. Cha kwanza ni Wasiliana kwa WhatsApp, kwa msaada wa haraka kuhusu akaunti au malipo. Cha pili ni Tuma SMS ya kawaida, kutuma ujumbe wa kawaida moja kwa moja kwenda namba yetu ya huduma. Na cha tatu ni Jiunge na WhatsApp Channel, ili kupata updates mbalimbali kuhusu account yako ya AdsCenter.';

const SUPPORT_GUIDE_CUES: SupportGuideCue[] = [
  { atSeconds: 0, option: null, label: 'Utangulizi · Machaguo 3' },
  { atSeconds: 3.25, option: 'whatsapp', label: '1/3 · Wasiliana kwa WhatsApp' },
  { atSeconds: 9.55, option: 'sms', label: '2/3 · Tuma SMS ya Kawaida' },
  { atSeconds: 16.8, option: 'channel', label: '3/3 · Jiunge na WhatsApp Channel' },
];

function getGuideCueForTime(seconds: number): SupportGuideCue {
  let matched = SUPPORT_GUIDE_CUES[0];
  for (let i = 0; i < SUPPORT_GUIDE_CUES.length; i += 1) {
    if (seconds >= SUPPORT_GUIDE_CUES[i].atSeconds) {
      matched = SUPPORT_GUIDE_CUES[i];
    }
  }
  return matched;
}

const SPRING_SHEET = {
  type: 'spring' as const,
  stiffness: 460,
  damping: 36,
  mass: 0.78,
};

const SPRING_TAP = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 30,
};

export function SupportContactModal({ open, onClose, productTitle }: SupportContactModalProps) {
  const defaultMessage = productTitle
    ? `Habari, nahitaji maelezo au kununua bidhaa hii: ${productTitle}`
    : 'Habari, nahitaji msaada kuhusu akaunti na malipo yangu ya AdsCenter.';

  const [whatsappRejected, setWhatsappRejected] = useState(false);
  const [smsText, setSmsText] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  const [guideStatus, setGuideStatus] = useState<
    'idle' | 'loading' | 'playing' | 'needs-tap' | 'ended' | 'muted'
  >('idle');
  const [activeCue, setActiveCue] = useState<SupportGuideCue | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackUrlRef = useRef<string | null>(null);
  const playTokenRef = useRef(0);

  const stopGuide = useCallback(() => {
    playTokenRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
    }
    setActiveCue(null);
  }, []);

  const attachAudioSync = useCallback(
    (audio: HTMLAudioElement, token: number, allowApiFallback: boolean) => {
      audio.ontimeupdate = () => {
        if (token !== playTokenRef.current) return;
        const cue = getGuideCueForTime(audio.currentTime);
        setActiveCue((prev) =>
          prev?.option === cue.option && prev?.label === cue.label ? prev : cue,
        );
      };

      audio.onended = () => {
        if (token !== playTokenRef.current) return;
        setActiveCue(null);
        setGuideStatus('ended');
      };

      audio.onerror = async () => {
        if (token !== playTokenRef.current) return;
        if (allowApiFallback) {
          try {
            let url = fallbackUrlRef.current;
            if (!url) {
              const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: SUPPORT_GUIDE_SPEECH_TEXT }),
              });
              if (!res.ok) throw new Error('TTS fallback failed');
              const blob = await res.blob();
              url = URL.createObjectURL(blob);
              fallbackUrlRef.current = url;
            }
            if (token !== playTokenRef.current) return;
            audio.src = url;
            attachAudioSync(audio, token, false);
            await audio.play();
            if (token === playTokenRef.current) {
              setGuideStatus('playing');
            }
            return;
          } catch {
            if (token !== playTokenRef.current) return;
          }
        }
        setActiveCue(null);
        setGuideStatus('ended');
      };
    },
    [],
  );

  const startGuide = useCallback(() => {
    stopGuide();
    const token = playTokenRef.current;
    const audio = audioRef.current;
    if (!audio) return;

    const src = fallbackUrlRef.current || SUPPORT_GUIDE_AUDIO_URL;
    if (audio.getAttribute('src') !== src) {
      audio.src = src;
    }
    audio.currentTime = 0;
    setActiveCue(SUPPORT_GUIDE_CUES[0]);
    setGuideStatus('loading');
    attachAudioSync(audio, token, !fallbackUrlRef.current);

    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        if (token === playTokenRef.current) {
          setGuideStatus('playing');
        }
      }).catch(() => {
        if (token === playTokenRef.current) {
          setActiveCue(null);
          setGuideStatus('needs-tap');
        }
      });
    }
  }, [attachAudioSync, stopGuide]);

  useEffect(() => {
    if (open) {
      setWhatsappRejected(false);
      setSmsText(defaultMessage);
      setCopied(false);
    } else {
      stopGuide();
      setGuideStatus('idle');
    }
  }, [open, defaultMessage, stopGuide]);

  // Automatically start female voice tutorial whenever the 3 support options sheet opens
  useEffect(() => {
    if (!open || whatsappRejected) {
      stopGuide();
      return;
    }
    const timer = window.setTimeout(() => {
      startGuide();
    }, 90);

    return () => {
      window.clearTimeout(timer);
      stopGuide();
    };
  }, [open, whatsappRejected, startGuide, stopGuide]);

  const handleToggleGuideMute = () => {
    unlockAudio();
    if (guideStatus === 'playing' || guideStatus === 'loading') {
      stopGuide();
      setGuideStatus('muted');
    } else {
      startGuide();
    }
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_PHONE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const highlightedOption = activeCue?.option ?? null;

  const getOptionHighlightClass = (option: SupportOptionKey) => {
    if (!highlightedOption) return 'opacity-100 scale-100';
    if (highlightedOption === option) {
      if (option === 'channel') {
        return 'opacity-100 scale-[1.02] ring-4 ring-emerald-500/75 shadow-[0_0_26px_rgba(16,185,129,0.35)] border-emerald-500/60';
      }
      return 'opacity-100 scale-[1.02] ring-4 ring-sky-400/80 shadow-[0_0_26px_rgba(56,189,248,0.45)]';
    }
    return 'opacity-50 scale-[0.985]';
  };

  return (
    <>
      <audio ref={audioRef} playsInline preload="auto" className="hidden" />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-[#050E1F]/70 p-2.5 backdrop-blur-xl sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 48, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 36, scale: 0.96 }}
              transition={SPRING_SHEET}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-[30px] border border-[#DCE5F4] bg-white/95 text-[#0A192F] shadow-2xl shadow-blue-950/35 ring-1 ring-white/60 backdrop-blur-2xl"
            >
              {/* Mobile Sheet Handle */}
              <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
                <span className="h-1 w-10 rounded-full bg-slate-300/80" />
              </div>

              <div className="flex items-center justify-between border-b border-[#E7EEF8] px-5 pt-3.5 pb-4 sm:pt-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  {whatsappRejected && (
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      transition={SPRING_TAP}
                      type="button"
                      onClick={() => setWhatsappRejected(false)}
                      aria-label="Rudi nyuma"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#EEF3FA] text-[#0A192F] transition hover:bg-[#DCE5F4]"
                    >
                      <ArrowLeft className="size-4" />
                    </motion.button>
                  )}
                  <div className="min-w-0">
                    <h2
                      id="support-modal-title"
                      className="font-display text-lg font-extrabold tracking-tight text-[#0A192F]"
                    >
                      {productTitle ? 'Wasiliana na Muuzaji' : 'Huduma kwa Wateja'}
                    </h2>
                    <p className="truncate text-xs font-medium text-slate-500">
                      {productTitle ? productTitle : 'Chagua njia ya mawasiliano ya haraka'}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  transition={SPRING_TAP}
                  type="button"
                  onClick={onClose}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EEF3FA] text-slate-600 transition hover:bg-[#DDE6F4] hover:text-[#0A192F]"
                  aria-label="Funga"
                >
                  <X className="size-4" />
                </motion.button>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait" initial={false}>
                  {!whatsappRejected ? (
                    <motion.div
                      key="support-options"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -14 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-3"
                    >
                      {/* Voice Guide Status Strip */}
                      <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#DCE5F4] bg-[#F4F8FE] px-3.5 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                          {guideStatus === 'loading' ? (
                            <Loader2
                              className="size-4 shrink-0 animate-spin text-[#155EEF]"
                              aria-hidden="true"
                            />
                          ) : guideStatus === 'playing' ? (
                            <Volume2
                              className="size-4 shrink-0 animate-pulse text-[#155EEF]"
                              aria-hidden="true"
                            />
                          ) : (
                            <VolumeX
                              className="size-4 shrink-0 text-slate-500"
                              aria-hidden="true"
                            />
                          )}
                          <span className="truncate text-xs font-bold text-[#0A192F]">
                            {guideStatus === 'playing' && activeCue
                              ? activeCue.label
                              : guideStatus === 'loading'
                                ? 'Inaandaa mwongozo wa sauti...'
                                : guideStatus === 'needs-tap'
                                  ? 'Bonyeza kusikiliza mwongozo'
                                  : 'Mwongozo wa Huduma kwa Wateja'}
                          </span>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          transition={SPRING_TAP}
                          type="button"
                          onClick={handleToggleGuideMute}
                          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-[#CFE0F5] bg-white px-2.5 py-1 text-[11px] font-bold text-[#155EEF] transition hover:bg-[#EAF2FD]"
                        >
                          {guideStatus === 'playing' || guideStatus === 'loading' ? (
                            <>
                              <VolumeX className="size-3" aria-hidden="true" />
                              <span>Zima</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="size-3" aria-hidden="true" />
                              <span>{guideStatus === 'needs-tap' ? 'Sikiliza' : 'Rudia'}</span>
                            </>
                          )}
                        </motion.button>
                      </div>

                      <p className="text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
                        Chagua chaguo unalopendelea hapa chini kuwasiliana nasi au kujiunga moja kwa
                        moja:
                      </p>

                      {/* Option 1: WhatsApp Direct (Preserved) */}
                      <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.965 }}
                        transition={SPRING_TAP}
                        type="button"
                        onClick={() => {
                          stopGuide();
                          setWhatsappRejected(true);
                        }}
                        className={`group flex min-h-16 w-full items-center justify-between gap-3 rounded-[22px] bg-gradient-to-r from-[#155EEF] to-[#1D6BFF] px-3.5 py-3 text-left text-white shadow-lg shadow-blue-600/20 ring-1 ring-sky-300/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/30 ${getOptionHighlightClass('whatsapp')}`}
                      >
                        <span className="flex min-w-0 items-center gap-3.5">
                          <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-white/18 text-white backdrop-blur-sm">
                            <MessageCircle className="size-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-display text-sm font-bold text-white sm:text-[15px]">
                              Wasiliana kwa WhatsApp
                            </span>
                            <span className="block text-xs font-medium text-blue-100/85">
                              Msaada wa haraka kuhusu akaunti &amp; malipo
                            </span>
                          </span>
                        </span>
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-transform duration-200 group-hover:translate-x-0.5">
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </span>
                      </motion.button>

                      {/* Option 2: Normal Text / SMS (Preserved) */}
                      <motion.a
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.965 }}
                        transition={SPRING_TAP}
                        href={buildSmsHref(smsText)}
                        onClick={stopGuide}
                        className={`group flex min-h-16 w-full items-center justify-between gap-3 rounded-[22px] bg-[#0A1931] px-3.5 py-3 text-left text-white shadow-md shadow-blue-950/20 ring-1 ring-white/10 transition-all duration-300 hover:bg-[#11264A] ${getOptionHighlightClass('sms')}`}
                      >
                        <span className="flex min-w-0 items-center gap-3.5">
                          <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-sky-400/18 text-sky-300">
                            <MessageSquareText className="size-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-display text-sm font-bold text-white sm:text-[15px]">
                              Tuma SMS ya Kawaida
                            </span>
                            <span className="block font-mono text-xs font-medium text-blue-200/85 tabular-nums">
                              {SUPPORT_PHONE_DISPLAY}
                            </span>
                          </span>
                        </span>
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-sky-300 transition-transform duration-200 group-hover:translate-x-0.5">
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </span>
                      </motion.a>

                      {/* Option 3: WhatsApp Channel (New) */}
                      <motion.a
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.965 }}
                        transition={SPRING_TAP}
                        href={WHATSAPP_CHANNEL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={stopGuide}
                        className={`group flex min-h-16 w-full items-center justify-between gap-3 rounded-[22px] border border-[#CFE0F5] bg-[#F4F8FE] px-3.5 py-3 text-left text-[#0A192F] shadow-xs transition-all duration-300 hover:border-[#8BB2E8] hover:bg-[#EAF2FD] ${getOptionHighlightClass('channel')}`}
                      >
                        <span className="flex min-w-0 items-center gap-3.5">
                          <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-gradient-to-br from-[#16A34A] to-[#0D7A38] text-white shadow-sm">
                            <Radio className="size-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-display text-sm font-bold text-[#0A192F] sm:text-[15px]">
                              Jiunge na WhatsApp Channel
                            </span>
                            <span className="block text-xs font-medium text-slate-600">
                              Updates mbalimbali kuhusu account yako ya AdsCenter
                            </span>
                          </span>
                        </span>
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#DCE8FA] text-[#155EEF] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        </span>
                      </motion.a>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="support-sms-fallback"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 14 }}
                      transition={SPRING_SHEET}
                      className="space-y-4"
                    >
                    <div
                      className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-950"
                      role="alert"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          className="mt-0.5 size-5 shrink-0 text-red-600"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-display text-sm font-bold text-red-900">
                            WhatsApp haipatikani kwa sasa!
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-red-800">
                            Hitilafu kwenye mfumo wa WhatsApp. Tafadhali tuma ujumbe wa kawaida
                            (Normal Text / SMS) kwenda namba{' '}
                            <span className="font-mono font-bold tabular-nums">
                              {SUPPORT_PHONE_DISPLAY}
                            </span>
                            .
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="sms-message-input"
                        className="block text-xs font-semibold text-[#0A192F]"
                      >
                        Andika ujumbe wako wa kawaida (SMS):
                      </label>
                      <textarea
                        id="sms-message-input"
                        rows={3}
                        value={smsText}
                        onChange={(e) => setSmsText(e.target.value)}
                        className="mt-1.5 w-full rounded-2xl border border-[#D5E0F0] bg-[#F4F7FC] px-3.5 py-2.5 text-sm text-[#0A192F] outline-none transition focus:border-[#155EEF] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <motion.a
                        whileTap={{ scale: 0.965 }}
                        transition={SPRING_TAP}
                        href={buildSmsHref(smsText)}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#155EEF] px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-[#1049C5]"
                      >
                        <Send className="size-4 shrink-0" aria-hidden="true" />
                        <span className="whitespace-nowrap">
                          Tuma Normal Text (SMS) · {SUPPORT_PHONE_DISPLAY}
                        </span>
                      </motion.a>

                      <motion.button
                        whileTap={{ scale: 0.965 }}
                        transition={SPRING_TAP}
                        type="button"
                        onClick={handleCopyPhone}
                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#D5E0F0] bg-[#EEF3FA] px-4 py-2.5 text-xs font-semibold text-[#0A192F] transition hover:bg-[#DDE6F4]"
                      >
                        {copied ? (
                          <>
                            <Check className="size-4 text-emerald-600" aria-hidden="true" />
                            <span>Namba {SUPPORT_PHONE} imenakiliwa!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-4 text-[#155EEF]" aria-hidden="true" />
                            <span>Nakili namba ya SMS ({SUPPORT_PHONE_DISPLAY})</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
