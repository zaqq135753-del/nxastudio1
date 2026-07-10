import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyAffiliate, registerReferral, type AffiliateStats } from "@/lib/affiliates.functions";
import { Copy, Check, Users, DollarSign, Sparkles, Gift } from "lucide-react";

export const Route = createFileRoute("/_authenticated/afiliados")({
  component: Afiliados,
});

function Afiliados() {
  const load = useServerFn(getMyAffiliate);
  const register = useServerFn(registerReferral);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // auto-register referral from ?ref=XXXX cookie/URL
    const url = new URL(window.location.href);
    const code = url.searchParams.get("ref") ?? localStorage.getItem("nxa_ref");
    if (code) {
      localStorage.setItem("nxa_ref", code);
      register({ data: { code } }).catch(() => {});
    }
    load().then(setStats).catch(() => {});
  }, [load, register]);

  async function submitRef() {
    if (!refCode.trim()) return;
    const res = await register({ data: { code: refCode.trim() } });
    setMsg(res.ok ? "Código aplicado ✨" : `Não foi possível: ${res.reason}`);
    if (res.ok) setRefCode("");
  }

  const link = stats ? `${window.location.origin}/auth?ref=${stats.code}` : "";

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs">
            <Gift className="h-3.5 w-3.5 text-primary" /> Programa de afiliados
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Ganhe 30% recorrente</h1>
          <p className="text-muted-foreground text-sm">
            Compartilhe seu link. A cada assinante pago, você recebe 30% enquanto ele estiver ativo.
          </p>
        </header>

        {stats && (
          <>
            <div className="rounded-3xl border border-border/60 bg-card/50 p-6 space-y-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Seu link único</div>
              <div className="flex items-center gap-2">
                <input readOnly value={link}
                  className="flex-1 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm font-mono" />
                <button onClick={copy}
                  className="rounded-2xl bg-foreground text-background px-4 py-3 text-sm font-medium inline-flex items-center gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <div className="text-xs text-muted-foreground">
                Código: <span className="font-mono font-semibold">{stats.code}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stat icon={<Sparkles className="h-4 w-4" />} label="Cliques" value={stats.clicks} />
              <Stat icon={<Users className="h-4 w-4" />} label="Cadastros" value={stats.signups} />
              <Stat icon={<DollarSign className="h-4 w-4" />} label="Estimado" value={`R$ ${stats.commission_estimate_brl}`} />
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/50 p-6">
              <div className="text-sm font-semibold mb-3">Indicações recentes</div>
              {stats.referrals.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma indicação ainda. Compartilhe seu link!</div>
              ) : (
                <ul className="space-y-2">
                  {stats.referrals.slice(0, 10).map((r) => (
                    <li key={r.referred_user_id} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{r.referred_user_id.slice(0, 8)}…</span>
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{r.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        <div className="rounded-3xl border border-dashed border-border/60 p-6 space-y-3">
          <div className="text-sm font-semibold">Fui indicado por alguém</div>
          <div className="flex gap-2">
            <input value={refCode} onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              className="flex-1 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm font-mono uppercase" />
            <button onClick={submitRef}
              className="rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium">
              Aplicar
            </button>
          </div>
          {msg && <div className="text-xs text-muted-foreground">{msg}</div>}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Comissões creditadas quando o pagamento for ativado. Por enquanto, apenas tracking.
        </p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
