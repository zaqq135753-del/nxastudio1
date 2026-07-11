import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

type Props = {
  placeholder?: string;
  suggestions?: readonly string[];
  onSubmit: (prompt: string) => void | Promise<void>;
  loading?: boolean;
};

/**
 * Barra de comando de IA reaproveitável, com sugestões clicáveis
 * (vindas de config.commandBar.suggestions).
 */
export function AICommandBar({ placeholder = "Fale com a IA…", suggestions = [], onSubmit, loading }: Props) {
  const [value, setValue] = useState("");

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setValue("");
    await onSubmit(t);
  };

  return (
    <div className="fade-up">
      <form
        onSubmit={(e) => { e.preventDefault(); void send(value); }}
        className="flex items-center gap-2 rounded-2xl border p-1.5 pl-4"
        style={{ background: "var(--card)", borderColor: "var(--line-1)" }}
      >
        <Sparkles size={16} style={{ color: "var(--n-500)" }} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
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
