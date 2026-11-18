import { CheckCircle2, Download, Share, Smartphone, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

interface InstallAppModalProps {
  open: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

export function InstallAppModal({
  open,
  onClose,
  isInstallable,
  isInstalled,
  isIOS,
  onInstall,
}: InstallAppModalProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    setInstalling(true);
    setStatusMessage(null);

    if (isInstallable) {
      const outcome = await onInstall();
      setInstalling(false);
      if (outcome === 'accepted') {
        setStatusMessage('Hongera! App ya AdsCenter imeongezwa kwenye simu yako.');
      } else if (outcome === 'dismissed') {
        setStatusMessage('Umesitisha kusakinisha app.');
      } else {
        setStatusMessage(
          'Fungua menu ya kivinjari chako (⋮) kisha chagua "Install app" au "Add to Home screen".',
        );
      }
      return;
    }

    setInstalling(false);
    if (isIOS) {
      setStatusMessage(
        'Kwenye iPhone/iPad (Safari): Bonyeza kitufe cha Share (↑) kilicho chini ya skrini, kisha chagua "Add to Home Screen" na ubonyeze Add.',
      );
      return;
    }

    setStatusMessage(
      'Kwenye Chrome / Edge: Bonyeza alama ya Menu (⋮) juu kulia kisha chagua "Install AdsCenter" au "Add to Home screen" ili kuiweka kama App kamili.',
    );
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
          aria-labelledby="install-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.85 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-[26px] border border-slate-200 bg-white p-6 text-center text-slate-900 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3.5 top-3.5 grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition active:scale-90 hover:bg-slate-200 hover:text-slate-900"
              aria-label="Funga"
            >
              <X className="size-4" />
            </button>

            <div className="mx-auto grid size-16 place-items-center rounded-[20px] bg-[#0B1220] text-emerald-400 shadow-lg">
              <Smartphone className="size-8" aria-hidden="true" />
            </div>

            <h2
              id="install-modal-title"
              className="mt-4 font-display text-xl font-bold text-slate-900"
            >
              Download App ya AdsCenter
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Weka AdsCenter kwenye skrini kuu ya simu yako (Android na iPhone) ifunguke kama App
              kamili bila bar ya kivinjari.
            </p>

            {isIOS && !isInstalled && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-left text-xs text-slate-700">
                <p className="font-bold text-slate-900">Maelekezo ya iPhone / iPad (Safari):</p>
                <ol className="mt-1.5 list-decimal space-y-1 pl-4">
                  <li>
                    Bonyeza alama ya <span className="inline-flex items-center gap-0.5 font-semibold"><Share className="size-3" /> Share</span> chini kwenye Safari.
                  </li>
                  <li>
                    Shuka chini kisha chagua <strong>Add to Home Screen</strong>.
                  </li>
                </ol>
              </div>
            )}

            {isInstalled && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                <span>Hongera! App ya AdsCenter tayari imesakinishwa.</span>
              </div>
            )}

            {statusMessage && !isInstalled && (
              <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                {statusMessage}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2.5">
              {!isInstalled && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  disabled={installing}
                  onClick={handleInstallClick}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
                >
                  <Download className="size-4" aria-hidden="true" />
                  <span>
                    {installing
                      ? 'Inaandaa App...'
                      : isInstallable
                        ? 'Sakinisha App Sasa (Install)'
                        : 'Weka Kwenye Simu (Download)'}
                  </span>
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onClose}
                className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Funga
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
