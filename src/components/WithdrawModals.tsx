import { AlertCircle, ArrowUpRight, CheckCircle2, Clock3, Loader2, Receipt, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { formatTsh, REGISTER_URL } from '../constants/config';
import type { WithdrawRecord } from '../hooks/useWallet';

interface WithdrawModalProps {
  open: boolean;
  balance: number;
  onClose: () => void;
  onRecordAttempt: (amount: number) => void;
}

export function WithdrawModal({ open, balance, onClose, onRecordAttempt }: WithdrawModalProps) {
  const [step, setStep] = useState<'input' | 'processing' | 'warning'>('input');
  const [amountInput, setAmountInput] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setStep('input');
      setAmountInput(balance > 0 ? String(balance) : '');
    }
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [open, balance]);

  const numericAmount = Number(amountInput);
  const canSubmit = Number.isFinite(numericAmount) && numericAmount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onRecordAttempt(numericAmount);
    setStep('processing');
    timerRef.current = window.setTimeout(() => {
      setStep('warning');
    }, 3200);
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-3 backdrop-blur-md sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.85 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-[26px] border border-slate-200 bg-white text-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 id="withdraw-modal-title" className="font-display text-lg font-bold">
                Toa Pesa
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition active:scale-90 hover:bg-slate-200 hover:text-slate-900"
                aria-label="Funga"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5">
              {step === 'input' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-xs font-medium text-slate-600">Salio ulilonalo</span>
                    <span className="font-mono text-base font-bold text-emerald-700 tabular-nums">
                      {formatTsh(balance)}
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor="withdraw-amount-input"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Ingiza kiasi unachotaka kutoa (TSh)
                    </label>
                    <div className="mt-1.5 flex items-center gap-2 rounded-2xl border-2 border-slate-900 bg-white px-4 py-4 transition focus-within:ring-4 focus-within:ring-orange-500/20">
                      <span className="font-display text-xl font-bold text-slate-400">TSh</span>
                      <input
                        id="withdraw-amount-input"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="0"
                        className="w-full min-w-0 bg-transparent text-right font-mono text-3xl font-bold tracking-tight text-slate-900 outline-none tabular-nums placeholder:text-slate-300"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[10000, 25000, 50000].map((preset) => (
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        key={preset}
                        type="button"
                        onClick={() => setAmountInput(String(preset))}
                        className="rounded-xl border border-slate-200 bg-slate-50 py-2 font-mono text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 tabular-nums"
                      >
                        {(preset / 1000).toFixed(0)}k
                      </motion.button>
                    ))}
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      type="button"
                      onClick={() => setAmountInput(String(balance > 0 ? balance : 15000))}
                      className="rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      Zote
                    </motion.button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={!canSubmit}
                    className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Toa Pesa Sasa
                  </motion.button>
                </form>
              )}

              {step === 'processing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <Loader2 className="size-12 animate-spin text-orange-600" aria-hidden="true" />
                  <p className="mt-4 font-display text-lg font-bold text-slate-900">
                    Inachakata malipo yako...
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Tafadhali subiri kidogo, tunakagua namba yako ya kupokelea malipo.
                  </p>
                </motion.div>
              )}

              {step === 'warning' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  className="flex flex-col items-center py-3 text-center"
                >
                  <div className="grid size-14 place-items-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle className="size-8" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-red-700">
                    Huwezi kupokea malipo bado!
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    Hakuna namba yoyote uliyo iweka kwenye mfumo ili kupokea malipo yako. Fungua
                    account sasa ili muamala wako uingizwe kwenye namba yako na kuepuka kupoteza
                    pesa zako.
                  </p>

                  <motion.a
                    whileTap={{ scale: 0.97 }}
                    href={REGISTER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
                  >
                    <span>Fungua Account Sasa</span>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </motion.a>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onClose}
                    className="mt-2.5 flex min-h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Rudi Nyuma
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface WithdrawHistoryModalProps {
  open: boolean;
  records: WithdrawRecord[];
  onClose: () => void;
}

export function WithdrawHistoryModal({ open, records, onClose }: WithdrawHistoryModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-3 backdrop-blur-md sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.85 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-[26px] border border-slate-200 bg-white text-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 id="history-modal-title" className="font-display text-lg font-bold">
                Withdraw History
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition active:scale-90 hover:bg-slate-200 hover:text-slate-900"
                aria-label="Funga"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              {records.length === 0 ? (
                <div className="py-10 text-center">
                  <Receipt className="mx-auto size-10 text-slate-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Bado hujafanya muamala wowote wa kutoa pesa.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Tazama video za wafanyabiashara ili kuongeza salio lako.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {records.map((rec) => (
                    <li
                      key={rec.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-display text-sm font-bold text-slate-900">
                          <Receipt className="size-4 text-slate-500" aria-hidden="true" />
                          <span>Risiti ya Muamala</span>
                        </span>
                        {rec.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                            <Clock3 className="size-3.5" aria-hidden="true" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>

                      <dl className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Namba ya muamala</dt>
                          <dd className="font-mono font-bold text-slate-900 tabular-nums">
                            {rec.id}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Kiasi</dt>
                          <dd className="font-mono font-bold text-slate-900 tabular-nums">
                            {formatTsh(rec.amount)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Tarehe</dt>
                          <dd className="font-medium text-slate-700 tabular-nums">
                            {new Date(rec.date).toLocaleString('sw-TZ')}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Hali</dt>
                          <dd className="font-bold text-amber-700">
                            {rec.status === 'approved' ? 'Imekamilika' : 'Inasubiri (Pending)'}
                          </dd>
                        </div>
                      </dl>

                      {rec.status !== 'approved' && (
                        <div className="mt-3 border-t border-slate-200 pt-2.5">
                          <p className="text-xs leading-relaxed text-slate-600">
                            Malipo yatakamilika baada ya kufungua account na kuweka namba yako ya
                            kupokelea.
                          </p>
                          <a
                            href={REGISTER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
                          >
                            <span>Fungua account sasa</span>
                            <ArrowUpRight className="size-3.5" aria-hidden="true" />
                          </a>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
