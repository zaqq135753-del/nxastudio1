import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  id: string;                 // chave usada em localStorage
  kicker?: string;            // "SEUS APPS"
  title: string;              // "Continue de onde parou"
  action?: ReactNode;         // texto/badge à direita
  defaultOpen?: boolean;
  count?: number;             // ex: 6 itens
  children: ReactNode;
};

/**
 * Seção recolhível com estado persistido em localStorage.
 * Deixa a home mais curta sem esconder informação.
 */
export function CollapsibleSection({
  id, kicker, title, action, defaultOpen = true, count, children,
}: Props) {
  const storageKey = `nxa:hub:section:${id}`;
  const [open, setOpen] = useState<boolean>(defaultOpen);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "1") setOpen(true);
      else if (saved === "0") setOpen(false);
    } catch { /* noop */ }
  }, [storageKey]);

  function toggle() {
    const next = !open;
    setOpen(next);
    try { localStorage.setItem(storageKey, next ? "1" : "0"); } catch { /* noop */ }
  }

  return (
    <section className="mb-6">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="group flex w-full items-end justify-between gap-3 rounded-2xl px-1 py-2 text-left transition hover:bg-[var(--n-100)]"
      >
        <div className="min-w-0">
          {kicker && <div className="edition-tag mb-1">{kicker}</div>}
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[18px] sm:text-[20px] font-semibold tracking-tight">
              {title}
            </h2>
            {typeof count === "number" && count > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ background: "var(--n-100)", color: "var(--muted-foreground)" }}
              >
                {count}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <span
            className="grid h-8 w-8 place-items-center rounded-full transition-transform"
            style={{
              background: "var(--n-100)",
              color: "var(--muted-foreground)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown size={16} />
          </span>
        </div>
      </button>

      {open && <div className="mt-4 fade-up">{children}</div>}
    </section>
  );
}
