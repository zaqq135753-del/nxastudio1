import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Sparkles, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/hub" });
    });
  }, [navigate]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/hub` },
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setSent(true);
  }

  async function signInGoogle() {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setGoogleLoading(false);
      return toast.error("Não foi possível entrar com Google.");
    }
    if (result.redirected) return;
    navigate({ to: "/hub" });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: editorial hero */}
      <div className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 mesh-hero" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="edition-tag" style={{ color: "var(--cream-200)" }}>
            SaborIA · Edição nº 001
          </div>
          <div>
            <div className="text-8xl leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--cream-50)" }}>
              O sabor<br />é <em style={{ color: "var(--saffron)" }}>seu</em>.
            </div>
            <p className="mt-6 max-w-md text-lg" style={{ color: "var(--cream-200)" }}>
              A primeira IA que aprende seu paladar, sua rotina e o que tem hoje na sua geladeira — e cozinha junto com você.
            </p>
            <div className="mt-8 space-y-2 text-sm" style={{ color: "var(--cream-200)" }}>
              {[
                "Receitas em 4 segundos com o que você já tem",
                "Plano semanal que respeita restrições e orçamento",
                "Nutri virtual 24h por voz ou texto",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check size={16} style={{ color: "var(--saffron)" }} /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="edition-tag">🍳 Cozinhando com inteligência desde 2026</div>
        </div>
      </div>

      {/* Right: auth card */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm fade-up">
          <div className="chip mb-6"><Sparkles size={12} /> IA ativa · sem senhas</div>
          <h1 className="text-4xl">Entrar no SaborIA</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--cream-400)" }}>
            Enviamos um link mágico pro seu e-mail. Sem senha pra decorar.
          </p>

          <button onClick={signInGoogle} disabled={googleLoading} className="btn-ghost mt-8 w-full">
            <GoogleGlyph /> {googleLoading ? "Abrindo Google…" : "Continuar com Google"}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs" style={{ color: "var(--cream-500)" }}>
            <div className="h-px flex-1" style={{ background: "var(--line-1)" }} />
            OU COM E-MAIL
            <div className="h-px flex-1" style={{ background: "var(--line-1)" }} />
          </div>

          {sent ? (
            <div className="surface p-6 text-center fade-in">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--brand-glow)" }}>
                <Mail style={{ color: "var(--saffron)" }} />
              </div>
              <div className="font-medium">Confira seu e-mail</div>
              <p className="mt-1 text-sm" style={{ color: "var(--cream-400)" }}>
                Enviamos um link pra <b>{email}</b>. Ele abre o app direto.
              </p>
              <button className="btn-ghost mt-4" onClick={() => setSent(false)}>Usar outro e-mail</button>
            </div>
          ) : (
            <form onSubmit={sendMagicLink} className="space-y-3">
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                autoFocus
              />
              <button type="submit" disabled={sending} className="btn-primary w-full">
                {sending ? "Enviando…" : (<>Receber link mágico <ArrowRight size={16} /></>)}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[11px]" style={{ color: "var(--cream-500)" }}>
            Ao continuar, você concorda com os Termos e a Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.6 19 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.1 4.5 9.3 9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.1-5.2c-2 1.4-4.5 2.3-7.2 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.2 39 16 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.1 5.2C41.4 35.3 43.5 30 43.5 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
  );
}
