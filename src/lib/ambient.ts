/**
 * Onda K — Ambiente sonoro sintético (WebAudio).
 * Sem assets externos: geradores de ruído filtrado.
 */

export type AmbientKind = "off" | "rain" | "forest" | "lofi";

type Handle = {
  ctx: AudioContext;
  stop: () => void;
};

let current: Handle | null = null;
let currentKind: AmbientKind = "off";

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  return new AC();
}

function noiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function startRain(ctx: AudioContext): Handle {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 3);
  src.loop = true;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 800;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 5000;
  const g = ctx.createGain();
  g.gain.value = 0.15;
  src.connect(hp).connect(lp).connect(g).connect(ctx.destination);
  src.start();
  return { ctx, stop: () => { try { src.stop(); } catch { /* noop */ } } };
}

function startForest(ctx: AudioContext): Handle {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 4);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1200;
  const g = ctx.createGain();
  g.gain.value = 0.1;
  src.connect(lp).connect(g).connect(ctx.destination);
  // canto de pássaro raro
  const bird = ctx.createOscillator();
  const bg = ctx.createGain();
  bg.gain.value = 0;
  bird.type = "triangle";
  bird.frequency.value = 2200;
  bird.connect(bg).connect(ctx.destination);
  bird.start();
  const chirp = window.setInterval(() => {
    const t = ctx.currentTime;
    bg.gain.cancelScheduledValues(t);
    bg.gain.setValueAtTime(0, t);
    bg.gain.linearRampToValueAtTime(0.03, t + 0.05);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    bird.frequency.setValueAtTime(1800 + Math.random() * 900, t);
  }, 4500);
  src.start();
  return {
    ctx,
    stop: () => {
      window.clearInterval(chirp);
      try { src.stop(); bird.stop(); } catch { /* noop */ }
    },
  };
}

function startLofi(ctx: AudioContext): Handle {
  // pad senoidal + vinyl noise
  const notes = [220, 277.18, 329.63, 392]; // A minor pad
  const oscs = notes.map((f) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = 0.03;
    o.connect(g).connect(ctx.destination);
    o.start();
    return o;
  });
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 2);
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2000;
  const g = ctx.createGain();
  g.gain.value = 0.04;
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start();
  return {
    ctx,
    stop: () => {
      try {
        src.stop();
        oscs.forEach((o) => o.stop());
      } catch { /* noop */ }
    },
  };
}

export function playAmbient(kind: AmbientKind) {
  stopAmbient();
  currentKind = kind;
  if (kind === "off") return;
  const ctx = ensureCtx();
  if (!ctx) return;
  if (kind === "rain") current = startRain(ctx);
  else if (kind === "forest") current = startForest(ctx);
  else if (kind === "lofi") current = startLofi(ctx);
}

export function stopAmbient() {
  if (current) {
    try {
      current.stop();
      void current.ctx.close();
    } catch { /* noop */ }
    current = null;
  }
  currentKind = "off";
}

export function getAmbient(): AmbientKind {
  return currentKind;
}
