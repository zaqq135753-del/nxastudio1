/**
 * Onda B — confetti leve sem dependência.
 * Uso: import { fireConfetti } from "@/lib/confetti"; fireConfetti();
 */
const COLORS = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#c084fc", "#f472b6"];

export function fireConfetti(count = 60, durationMs = 1600) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.className = "nxa-confetti";
  document.body.appendChild(layer);

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    const left = Math.random() * 100;
    const dx = (Math.random() - 0.5) * 40;
    const rot = 360 + Math.random() * 720;
    const delay = Math.random() * 200;
    const dur = durationMs + Math.random() * 600;
    s.style.left = `${left}vw`;
    s.style.background = COLORS[i % COLORS.length];
    s.style.setProperty("--dx", `${dx}vw`);
    s.style.setProperty("--rot", `${rot}deg`);
    s.style.animationDuration = `${dur}ms`;
    s.style.animationDelay = `${delay}ms`;
    s.style.transform = "translateY(-10vh)";
    layer.appendChild(s);
  }
  window.setTimeout(() => layer.remove(), durationMs + 1200);
}
