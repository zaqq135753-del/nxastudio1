/**
 * reward.ts — atalho pra premiar ações do usuário.
 * Chama awardXp no server, dispara xpToast + verifica level up + registra na Activity local.
 */
import { awardXp } from "@/lib/gamification.functions";
import { xpToast, checkLevelUp } from "@/lib/celebrate";

const ACT_KEY = "nxa:activity:v1";
const MAX_ITEMS = 30;

export type ActivityItem = { at: number; amount: number; reason: string; app?: string };

export function pushActivity(item: ActivityItem) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ACT_KEY);
    const arr: ActivityItem[] = raw ? JSON.parse(raw) : [];
    arr.unshift(item);
    localStorage.setItem(ACT_KEY, JSON.stringify(arr.slice(0, MAX_ITEMS)));
    window.dispatchEvent(new CustomEvent("nxa:activity"));
  } catch { /* noop */ }
}

export function readActivity(): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACT_KEY);
    return raw ? (JSON.parse(raw) as ActivityItem[]) : [];
  } catch { return []; }
}

/** Chama server-fn, mostra toast, verifica level. Nunca lança. */
export async function reward(amount: number, reason: string, app?: string) {
  xpToast(amount, reason);
  pushActivity({ at: Date.now(), amount, reason, app });
  try {
    const res = await awardXp({ data: { amount, reason } });
    checkLevelUp(res.level);
  } catch { /* silencioso — UI já respondeu */ }
}
