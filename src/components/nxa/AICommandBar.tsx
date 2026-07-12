import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getPersona, loadingPhrase } from "@/lib/personas";

type Props = {
  placeholder?: string;
  suggestions?: readonly string[];
  onSubmit: (prompt: string) => void | Promise<void>;
  loading?: boolean;
  /** Se informado, usa a persona/voz do app correspondente. */
  appSlug?: string;
};

export function AICommandBar({ placeholder, suggestions = [], onSubmit, loading, appSlug }: Props) {
  const [value, setValue] = useState("");
  const persona = getPersona(appSlug);
  const [phrase, setPhrase] = useState(() => loadingPhrase(appSlug));

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setPhrase(loadingPhrase(appSlug)), 2000);
    return () => clearInterval(id);
  }, [loading, appSlug]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setValue("");
    await onSubmit(t);
  };

  const ph = placeholder ?? persona.greeting;

  return (
    <div className="fade-up">
      <form
        onSubmit={(e) => { e.preventDefault(); void send(value); }}
        className="flex items-center gap-2 rounded-2xl border p-1.5 pl-3"
        style={{ background: "var(--card)", borderColor: "var(--line-1)" }}
      >
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[15px] ${loading ? "nxa-avatar-pulse" : ""}`}
          style={{ background: "var(--n-100)" }}
          aria-hidden
        >
          {persona.emoji}
        </span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={loading ? phrase : ph}
          disabled={loading}
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="press inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl disabled:opacity-40"
          style={{ background: "var(--foreground)", color: "var(--card)" }}
          aria-label="Enviar"
        >
          <ArrowRight size={16} />
        </button>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              disabled={loading}
              className="chip chip-neutral text-left"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
