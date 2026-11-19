let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state !== 'running') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function unlockAudio(): void {
  getAudioContext();
}

/**
 * Relaxing, short & appealing two-note warm bell chime (A4 -> C#5)
 * Soft low-pass envelope with gentle attack and clean decay for mobile speakers.
 */
export function playNotificationChime(muted = false): void {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1350, ctx.currentTime);
    filter.Q.value = 0.7;

    const master = ctx.createGain();
    master.gain.value = 0.18;
    filter.connect(master);
    master.connect(ctx.destination);

    // Gentle warm Major-3rd interval: A4 (440 Hz) -> C#5 (554.37 Hz)
    const notes = [
      { freq: 440.0, at: 0, dur: 0.22, amp: 0.34 },
      { freq: 554.37, at: 0.085, dur: 0.28, amp: 0.3 },
    ];

    notes.forEach(({ freq, at, dur, amp }) => {
      const start = ctx.currentTime + 0.01 + at;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(amp, start + 0.022);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  } catch {
    // Ignore audio errors
  }
}

/**
 * Warm, uplifting chord chime when a video reward is credited.
 */
export function playRewardChime(muted = false): void {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, ctx.currentTime);
    filter.Q.value = 0.7;

    const master = ctx.createGain();
    master.gain.value = 0.24;
    filter.connect(master);
    master.connect(ctx.destination);

    // Warm A-major lift: A4 -> C#5 -> E5 -> A5
    const tones = [
      { freq: 440.0, at: 0, dur: 0.32, vol: 0.3 },
      { freq: 554.37, at: 0.065, dur: 0.34, vol: 0.32 },
      { freq: 659.25, at: 0.13, dur: 0.38, vol: 0.34 },
      { freq: 880.0, at: 0.2, dur: 0.52, vol: 0.28 },
    ];

    tones.forEach(({ freq, at, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + 0.015 + at;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(start);
      osc.stop(start + dur + 0.03);
    });
  } catch {
    // Ignore audio errors
  }
}
