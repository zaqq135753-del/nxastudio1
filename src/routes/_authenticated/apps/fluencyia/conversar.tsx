import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { conversationTurn, getLangProfile, LANGS, type ConversationTurn } from "@/lib/fluency.functions";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { MicButton } from "@/components/voice/MicButton";
import { SpeakButton } from "@/components/voice/SpeakButton";

export const Route = createFileRoute("/_authenticated/apps/fluencyia/conversar")({
  component: ConversarPage,
});

type Turn = { role: "user" | "assistant"; content: string; extra?: ConversationTurn };

function ConversarPage() {
  const [profile, setProfile] = useState<{ target_lang: string; level: string } | null>(null);
  const [topic, setTopic] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchProfile = useServerFn(getLangProfile);
  const sendTurn = useServerFn(conversationTurn);

  useEffect(() => { fetchProfile().then((p) => setProfile(p as never)); }, [fetchProfile]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    const next: Turn[] = [...turns, { role: "user", content: msg }];
    setTurns(next);
    setLoading(true);
    try {
      const history = turns.map((t) => ({ role: t.role, content: t.content }));
      const res = await sendTurn({
        data: {
          targetLang: profile?.target_lang ?? "en",
          level: profile?.level ?? "A1",
          topic, history, message: msg,
        },
      });
      setTurns([...next, { role: "assistant", content: res.reply, extra: res }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally { setLoading(false); }
  }

  const langName = LANGS[profile?.target_lang ?? "en"] ?? "Inglês";

  return (
    <AppShell appSlug="fluencyia">
      <ScreenHeader title={`Conversar em ${langName}`} subtitle="A IA responde no idioma alvo, traduz e corrige." />

      <div className="mb-4">
        <input value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="Tópico (opcional): viagens, trabalho, comida…"
          className="input-field w-full" />
      </div>

      <div className="space-y-3 mb-4">
        {turns.length === 0 && !loading && (
          <div className="surface p-5 text-sm" style={{ color: "var(--n-500)" }}>
            Comece falando algo em {langName} ou em português. Ex.: "Hi! I want to talk about my last trip."
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`surface p-4 ${t.role === "user" ? "ml-8" : "mr-8"}`}>
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--n-500)" }}>
                {t.role === "user" ? "Você" : "Tutor IA"}
              </div>
              {t.role === "assistant" && <SpeakButton text={t.content} />}
            </div>
            <div className="text-[15px]">{t.content}</div>
            {t.extra && (
              <>
                <div className="mt-2 text-sm" style={{ color: "var(--n-500)" }}>🇧🇷 {t.extra.translation}</div>
                {t.extra.correction && (
                  <div className="mt-2 rounded-lg p-2 text-sm" style={{ background: "rgba(239,68,68,0.08)" }}>
                    ✏️ {t.extra.correction}
                  </div>
                )}
                {t.extra.suggestion && (
                  <div className="mt-2 text-sm" style={{ color: "var(--n-500)" }}>
                    💡 Tente: <button onClick={() => setInput(t.extra!.suggestion)} className="underline">{t.extra.suggestion}</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {loading && <TypingIndicator label="pensando…" />}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-24 left-1/2 z-30 w-full max-w-[820px] -translate-x-1/2 px-4">
        <div className="glass flex items-center gap-2 rounded-full p-2" style={{ boxShadow: "var(--shadow-elev)" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Escreva ou fale em ${langName} ou pt-BR…`}
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
          <MicButton onTranscript={(t) => setInput((v) => (v ? v + " " : "") + t)} disabled={loading} />
          <button onClick={send} disabled={loading || !input.trim()}
            className="btn-primary rounded-full !p-2.5"><Send size={16} /></button>
        </div>
      </div>
    </AppShell>
  );
}
