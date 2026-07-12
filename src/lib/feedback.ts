/**
 * Onda C — Delight tátil
 * Haptics + sound (opt-in) + ripple helper.
 */

const SOUND_KEY = "nxa:sound:enabled";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SOUND_KEY) === "1";
}
export function setSoundEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_KEY, on ? "1" : "0");
}

/** Vibração curta (mobile). Silencioso em desktop / sem suporte. */
export function haptic(pattern: number | number[] = 10) {
  if (typeof navigator === "undefined") return;
  try { navigator.vibrate?.(pattern); } catch { /* noop */ }
}

let audioCtx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
}

/** Beep sintético leve — só toca se o usuário optou por sons. */
export function beep(kind: "click" | "success" | "swoosh" = "click") {
  if (!isSoundEnabled()) return;
  const ac = ctx();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  const t = ac.currentTime;
  if (kind === "click") {
    o.type = "sine"; o.frequency.setValueAtTime(680, t);
    g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.start(t); o.stop(t + 0.09);
  } else if (kind === "success") {
    o.type = "triangle"; o.frequency.setValueAtTime(660, t);
    o.frequency.exponentialRampToValueAtTime(990, t + 0.14);
    g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.start(t); o.stop(t + 0.23);
  } else {
    o.type = "sine"; o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.18);
    g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.start(t); o.stop(t + 0.21);
  }
}

/** Ripple visual em elementos com classe .press (delegado, uma vez só). */
let rippleInstalled = false;
export function installRipple() {
  if (typeof document === "undefined" || rippleInstalled) return;
  rippleInstalled = true;
  document.addEventListener("pointerdown", (e) => {
    const target = e.target as HTMLElement | null;
    const host = target?.closest<HTMLElement>(".press");
    if (!host) return;
    haptic(8);
    beep("click");
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement("span");
    span.className = "nxa-ripple";
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${e.clientX - rect.left - size / 2}px`;
    span.style.top = `${e.clientY - rect.top - size / 2}px`;
    const prev = getComputedStyle(host).position;
    if (prev === "static") host.style.position = "relative";
    const prevOverflow = getComputedStyle(host).overflow;
    if (prevOverflow === "visible") host.style.overflow = "hidden";
    host.appendChild(span);
    window.setTimeout(() => span.remove(), 650);
  }, { passive: true });
}
