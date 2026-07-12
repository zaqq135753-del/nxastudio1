import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { APPS } from "@/apps/registry";
import { getAppVisual } from "@/apps/visual";
import { Search, ArrowRight } from "lucide-react";

type Item = { id: string; label: string; hint?: string; icon: string; to: string };

/**
 * Onda F — Command Palette universal (Cmd/Ctrl + K).
 * Busca apps + atalhos rápidos e navega direto.
 */
export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);

  const items = useMemo<Item[]>(() => {
    const apps: Item[] = APPS.filter((a) => a.status === "live").map((a) => {
      const v = getAppVisual(a.slug);
      return { id: `app:${a.slug}`, label: a.name, hint: a.tagline, icon: v?.emoji ?? "✨", to: a.route };
    });
    const shortcuts: Item[] = [
      { id: "s:hub", label: "Hub", hint: "Command Center", icon: "🏠", to: "/hub" },
      { id: "s:agent", label: "Agente IA", hint: "Peça qualquer coisa", icon: "🧠", to: "/agente" },
      { id: "s:memoria", label: "Memória", hint: "O que a NXA sabe de você", icon: "📚", to: "/memoria" },
      { id: "s:feed", label: "Feed social", hint: "O que a comunidade tá fazendo", icon: "💬", to: "/feed" },
      { id: "s:planos", label: "Planos", hint: "Base e Prime", icon: "💎", to: "/planos" },
      { id: "s:afiliados", label: "Afiliados", hint: "Ganhe indicando", icon: "🎁", to: "/afiliados" },
    ];
    return [...shortcuts, ...apps];
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items.slice(0, 12);
    return items.filter((it) =>
      it.label.toLowerCase().includes(t) || (it.hint?.toLowerCase().includes(t) ?? false)
    );
  }, [items, q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQ("");
        setI(0);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setI((n) => Math.min(n + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setI((n) => Math.max(n - 1, 0)); }
      if (e.key === "Enter") {
        const it = filtered[i];
        if (it) { setOpen(false); void navigate({ to: it.to }); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, i, navigate]);

  useEffect(() => { setI(0); }, [q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] animate-fade-in"
      style={{ background: "rgba(10,10,12,0.35)", backdropFilter: "blur(6px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border shadow-2xl animate-scale-in"
        style={{ background: "var(--card)", borderColor: "var(--line-1)" }}
      >
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--line-1)" }}>
          <Search size={16} style={{ color: "var(--n-500)" }} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar app, ação ou atalho…"
            className="min-w-0 flex-1 bg-transparent py-1 text-[15px] outline-none placeholder:opacity-60"
          />
          <kbd className="rounded border px-1.5 py-0.5 text-[10px]" style={{ borderColor: "var(--line-1)", color: "var(--n-500)" }}>ESC</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-1">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
              Nada encontrado.
            </li>
          )}
          {filtered.map((it, idx) => {
            const active = idx === i;
            return (
              <li key={it.id}>
                <button
                  onMouseEnter={() => setI(idx)}
                  onClick={() => { setOpen(false); void navigate({ to: it.to }); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition"
                  style={{ background: active ? "var(--n-100)" : "transparent" }}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[15px]" style={{ background: "var(--n-100)" }}>
                    {it.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium truncate">{it.label}</span>
                    {it.hint && <span className="block text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>{it.hint}</span>}
                  </span>
                  <ArrowRight size={14} style={{ color: "var(--n-500)" }} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t px-3 py-2 text-[11px]" style={{ borderColor: "var(--line-1)", color: "var(--muted-foreground)" }}>
          <span>↑↓ navegar · ↵ abrir</span>
          <span>⌘K a qualquer momento</span>
        </div>
      </div>
    </div>
  );
}
