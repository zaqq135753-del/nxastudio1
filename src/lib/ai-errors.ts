/**
 * Parsing e detecção amigável de erros do Lovable AI Gateway.
 * Usado no cliente para mostrar mensagens humanas e desabilitar UI de IA
 * quando os créditos zeram (402) ou passamos do rate limit (429).
 */

export type AiErrorKind = "no_credits" | "rate_limit" | "mic_denied" | "unknown";

export function classifyAiError(err: unknown): AiErrorKind {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();
  if (msg.includes("[no_credits]") || msg.includes("payment_required") || msg.includes("not enough credits") || msg.includes(" 402")) {
    return "no_credits";
  }
  if (msg.includes("[rate_limit]") || msg.includes("rate_limit") || msg.includes(" 429")) {
    return "rate_limit";
  }
  if (msg.includes("microfone") || msg.includes("permission") || msg.includes("notallowed")) {
    return "mic_denied";
  }
  return "unknown";
}

export function friendlyAiError(err: unknown): string {
  switch (classifyAiError(err)) {
    case "no_credits":
      return "IA sem crédito agora — o admin precisa recarregar para continuar.";
    case "rate_limit":
      return "Muitas requisições em pouco tempo. Aguarde um instante.";
    case "mic_denied":
      return "Permita o acesso ao microfone nas configurações do navegador.";
    default:
      return err instanceof Error && err.message ? err.message : "Falha ao chamar a IA.";
  }
}

// ---------- Global "AI outage" flag (compartilhado entre componentes) ----------

const OUTAGE_KEY = "nxa:ai_outage_until";
const EVT = "nxa:ai_outage";

/** Marca a IA como fora do ar por N minutos (padrão 10). */
export function markAiOutage(minutes = 10) {
  const until = Date.now() + minutes * 60_000;
  try { localStorage.setItem(OUTAGE_KEY, String(until)); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: until }));
}

export function clearAiOutage() {
  try { localStorage.removeItem(OUTAGE_KEY); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: 0 }));
}

export function isAiOutOfService(): boolean {
  try {
    const raw = localStorage.getItem(OUTAGE_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (Number.isNaN(until) || until < Date.now()) {
      localStorage.removeItem(OUTAGE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

import { useEffect, useState } from "react";

/** Hook React que reage a mudanças de estado da IA. */
export function useAiOutage() {
  const [outage, setOutage] = useState<boolean>(false);
  useEffect(() => {
    setOutage(isAiOutOfService());
    const check = () => setOutage(isAiOutOfService());
    window.addEventListener(EVT, check);
    const iv = window.setInterval(check, 30_000);
    return () => { window.removeEventListener(EVT, check); window.clearInterval(iv); };
  }, []);
  return outage;
}

/**
 * Handler unificado — chama no catch de qualquer chamada de IA no cliente.
 * Mostra toast amigável, marca outage se for 402, e devolve o kind.
 */
export function handleAiError(err: unknown, toast: { error: (m: string) => void }): AiErrorKind {
  const kind = classifyAiError(err);
  if (kind === "no_credits") markAiOutage(10);
  toast.error(friendlyAiError(err));
  return kind;
}
