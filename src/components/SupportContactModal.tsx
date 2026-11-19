import { AlertTriangle, Check, Copy, MessageCircle, MessageSquareText, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { buildSmsHref, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from '../constants/config';

interface SupportContactModalProps {
  open: boolean;
  onClose: () => void;
  productTitle?: string | null;
}

export function SupportContactModal({ open, onClose, productTitle }: SupportContactModalProps) {
  const defaultMessage = productTitle
    ? `Habari, nahitaji maelezo au kununua bidhaa hii: ${productTitle}`
    : 'Habari, nahitaji msaada kuhusu akaunti na malipo yangu ya AdsCenter.';

  const [whatsappRejected, setWhatsappRejected] = useState(false);
  const [smsText, setSmsText] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setWhatsappRejected(false);
      setSmsText(defaultMessage);
      setCopied(false);
    }
  }, [open, defaultMessage]);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_PHONE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#061124]/70 p-3 backdrop-blur-md sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.85 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-[26px] border border-[#D5E0F0] bg-white text-[#0A192F] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E5ECF6] px-5 py-4">
              <div>
                <h2 id="support-modal-title" className="font-display text-lg font-bold text-[#0A192F]">
                  {productTitle ? 'Wasiliana na Muuzaji' : 'Huduma kwa Wateja'}
                </h2>
                <p className="text-xs text-slate-500">
                  {productTitle ? productTitle : 'Chagua njia ya mawasiliano ya haraka'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-[#EEF3FA] text-slate-600 transition active:scale-90 hover:bg-[#DDE6F4] hover:text-[#0A192F]"
                aria-label="Funga"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {!whatsappRejected ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Bonyeza kitufe unachopendelea hapa chini ili kuwasiliana nasi moja kwa moja:
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setWhatsappRejected(true)}
                    className="flex min-h-12 w-full items-center justify-between rounded-2xl bg-[#155EEF] px-4 py-3 text-left font-semibold text-white transition hover:bg-[#1049C5]"
                  >
                    <span className="flex items-center gap-3">
                      <MessageCircle className="size-5 shrink-0" aria-hidden="true" />
                      <span>Wasiliana kwa WhatsApp</span>
                    </span>
                    <span className="text-xs font-medium text-blue-100">Fungua</span>
                  </motion.button>

                  <motion.a
                    whileTap={{ scale: 0.97 }}
                    href={buildSmsHref(smsText)}
                    className="flex min-h-12 w-full items-center justify-between rounded-2xl bg-[#0A1931] px-4 py-3 font-semibold text-white transition hover:bg-[#122952]"
                  >
                    <span className="flex items-center gap-3">
                      <MessageSquareText className="size-5 shrink-0" aria-hidden="true" />
                      <span>Tuma SMS ya Kawaida</span>
                    </span>
                    <span className="font-mono text-xs text-blue-200 tabular-nums">
                      {SUPPORT_PHONE_DISPLAY}
                    </span>
                  </motion.a>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
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
                      className="mt-1.5 w-full rounded-2xl border border-[#D5E0F0] bg-[#F4F7FC] px-3.5 py-2.5 text-sm text-[#0A192F] outline-none transition focus:border-[#155EEF] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <motion.a
                      whileTap={{ scale: 0.97 }}
                      href={buildSmsHref(smsText)}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#155EEF] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1049C5]"
                    >
                      <Send className="size-4 shrink-0" aria-hidden="true" />
                      <span className="whitespace-nowrap">
                        Tuma Normal Text (SMS) · {SUPPORT_PHONE_DISPLAY}
                      </span>
                    </motion.a>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
