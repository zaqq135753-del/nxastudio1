/**
 * Onda G — Micro-celebrações
 * XP toast animado + Level Up modal cinematográfico (DOM injetado, sem deps).
 */
import { fireConfetti } from "./confetti";
import { beep, haptic } from "./feedback";

const LEVEL_KEY = "nxa:level:last";

/** XP toast flutuante no canto inferior direito. */
export function xpToast(amount: number, reason?: string) {
  if (typeof document === "undefined") return;
  if (amount <= 0) return;
  haptic(6);
  beep("click");

  const el = document.createElement("div");
  el.className = "nxa-xp-toast";
  el.innerHTML = `
    <span class="nxa-xp-toast__icon">✨</span>
    <span class="nxa-xp-toast__amount">+${amount} XP</span>
    ${reason ? `<span class="nxa-xp-toast__reason">${reason}</span>` : ""}
  `;
  document.body.appendChild(el);
  window.setTimeout(() => el.classList.add("is-out"), 1800);
  window.setTimeout(() => el.remove(), 2400);
}

/** Modal cinematográfico de subida de nível. */
export function levelUpModal(newLevel: number, opts?: { onClose?: () => void }) {
  if (typeof document === "undefined") return;
  haptic([20, 60, 20]);
  fireConfetti(120, 2200);

  const wrap = document.createElement("div");
  wrap.className = "nxa-levelup";
  wrap.innerHTML = `
    <div class="nxa-levelup__backdrop"></div>
    <div class="nxa-levelup__card" role="dialog" aria-live="polite">
      <div class="nxa-levelup__ring"></div>
      <div class="nxa-levelup__kicker">Level Up</div>
      <div class="nxa-levelup__num">${newLevel}</div>
      <div class="nxa-levelup__msg">Você evoluiu. Novos desbloqueios te esperam.</div>
      <button class="nxa-levelup__btn" type="button">Continuar</button>
    </div>
  `;
  document.body.appendChild(wrap);
  const close = () => { wrap.classList.add("is-out"); window.setTimeout(() => { wrap.remove(); opts?.onClose?.(); }, 260); };
  wrap.querySelector<HTMLButtonElement>(".nxa-levelup__btn")?.addEventListener("click", close);
  wrap.querySelector<HTMLElement>(".nxa-levelup__backdrop")?.addEventListener("click", close);
  window.setTimeout(close, 6000);
}

/** Compara com o último nível salvo. Dispara modal se subiu. */
export function checkLevelUp(currentLevel: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LEVEL_KEY);
    const last = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(last) && currentLevel > last) {
      levelUpModal(currentLevel);
    }
    localStorage.setItem(LEVEL_KEY, String(currentLevel));
  } catch { /* noop */ }
}
