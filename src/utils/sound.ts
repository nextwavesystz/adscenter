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
 * Signature "Crystal Kalimbaphone" notification chime:
 * Warm low-pass filtered harmonic pluck (E5 -> B5 -> F#6 -> G#6)
 * designed to sound unique, organic, and catchy rather than a generic beep.
 */
export function playNotificationChime(muted = false): void {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3400, ctx.currentTime);
    filter.Q.value = 1.2;

    const master = ctx.createGain();
    master.gain.value = 0.26;
    filter.connect(master);
    master.connect(ctx.destination);

    // Warm Maj9 cascade: E5 (659.25), B5 (987.77), F#6 (1479.98), G#6 (1661.22)
    const sequence = [
      { freq: 659.25, at: 0, dur: 0.28, amp: 0.36 },
      { freq: 987.77, at: 0.055, dur: 0.28, amp: 0.34 },
      { freq: 1479.98, at: 0.11, dur: 0.34, amp: 0.32 },
      { freq: 1661.22, at: 0.165, dur: 0.44, amp: 0.26 },
    ];

    sequence.forEach(({ freq, at, dur, amp }) => {
      const start = ctx.currentTime + 0.01 + at;

      // Fundamental warm sine
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(freq, start);

      bodyGain.gain.setValueAtTime(0.0001, start);
      bodyGain.gain.exponentialRampToValueAtTime(amp, start + 0.012);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(filter);
      bodyOsc.start(start);
      bodyOsc.stop(start + dur + 0.02);

      // Soft octave harmonic shimmer (triangle)
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = 'triangle';
      shimmerOsc.frequency.setValueAtTime(freq * 2, start);

      shimmerGain.gain.setValueAtTime(0.0001, start);
      shimmerGain.gain.exponentialRampToValueAtTime(amp * 0.14, start + 0.008);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.45);

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(filter);
      shimmerOsc.start(start);
      shimmerOsc.stop(start + dur * 0.5);
    });
  } catch {
    // Ignore audio errors
  }
}

/**
 * Celebratory ascending harmonic chord when a video reward is credited.
 */
export function playRewardChime(muted = false): void {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4200, ctx.currentTime);

    const master = ctx.createGain();
    master.gain.value = 0.34;
    filter.connect(master);
    master.connect(ctx.destination);

    // D5 -> F#5 -> A5 -> C#6 -> E6 lush celebratory lift
    const tones = [
      { freq: 587.33, at: 0, dur: 0.4, vol: 0.35 },
      { freq: 739.99, at: 0.06, dur: 0.42, vol: 0.35 },
      { freq: 880.0, at: 0.12, dur: 0.48, vol: 0.38 },
      { freq: 1108.73, at: 0.18, dur: 0.55, vol: 0.32 },
      { freq: 1318.51, at: 0.24, dur: 0.72, vol: 0.3 },
    ];

    tones.forEach(({ freq, at, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + at);
      const start = ctx.currentTime + 0.02 + at;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(filter);
      osc.start(start);
      osc.stop(start + dur + 0.04);
    });
  } catch {
    // Ignore audio errors
  }
}
