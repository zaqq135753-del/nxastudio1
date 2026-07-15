import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PRICING } from "@/apps/pricing";
import { APPS } from "@/apps/registry";
import {
  getPricingOverrides,
  getPlatformSettings,
  adminUpsertPricingOverride,
  adminResetPricingOverride,
  adminUpsertSetting,
  adminDeleteSetting,
  adminTableCounts,
  type PricingOverride,
  type PlatformSetting,
} from "@/lib/settings.functions";
import { applyPricingOverrides } from "@/lib/pricing-overlay";
import { RotateCcw, Save, Trash2, Plus, Database } from "lucide-react";

const SLUGS = ["saboria","socialia","petia","fluencyia","glowia","granaia","fitia","styleia","cosmosia","roteiroia"] as const;

/* ---------- Preços ---------- */

export function AdminPricingTab() {
  const load = useServerFn(getPricingOverrides);
  const save = useServerFn(adminUpsertPricingOverride);
  const reset = useServerFn(adminResetPricingOverride);
  const [rows, setRows] = useState<Record<string, PricingOverride>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);

  async function reload() {
    const list = await load();
    const map: Record<string, PricingOverride> = {};
    for (const r of list) map[r.app_slug] = r;
    setRows(map);
    applyPricingOverrides(list);
    setDirty(new Set());
  }
  useEffect(() => { reload().catch(() => {}); }, []);

  function upd(slug: string, patch: Partial<PricingOverride>) {
    setRows((prev) => ({
      ...prev,
      [slug]: { ...(prev[slug] ?? { app_slug: slug, base_monthly: null, base_price_label: null, base_tagline: null, prime_monthly: null, prime_price_label: null, prime_tagline: null, updated_at: "" }), ...patch, app_slug: slug },
    }));
    setDirty((d) => new Set(d).add(slug));
  }

  async function onSave(slug: string) {
    setSaving(slug);
    try {
      const r = rows[slug];
      await save({ data: {
        app_slug: slug as (typeof SLUGS)[number],
        base_monthly: r?.base_monthly ?? null,
        base_price_label: r?.base_price_label ?? null,
        base_tagline: r?.base_tagline ?? null,
        prime_monthly: r?.prime_monthly ?? null,
        prime_price_label: r?.prime_price_label ?? null,
        prime_tagline: r?.prime_tagline ?? null,
      }});
      toast.success("Preço salvo — vale para todos os usuários.");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally { setSaving(null); }
  }

  async function onReset(slug: string) {
    if (!confirm(`Restaurar preço padrão de ${slug}?`)) return;
    try {
      await reset({ data: { app_slug: slug as (typeof SLUGS)[number] } });
      toast.success("Restaurado ao padrão.");
      await reload();
    } catch (e: any) { toast.error(e?.message ?? "Erro"); }
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="rounded-2xl border p-4" style={{ borderColor: "var(--line-1)", background: "var(--surface-1)" }}>
        <div className="text-sm font-medium">Preços dos apps</div>
        <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
          Edite valores mensais e rótulos. Campos em branco usam o preço padrão do código. Alterações valem imediatamente para todos.
        </p>
      </div>

      <div className="grid gap-3">
        {SLUGS.map((slug) => {
          const app = APPS.find((a) => a.slug === slug);
          const p = PRICING[slug];
          const r = rows[slug];
          const isDirty = dirty.has(slug);
          return (
            <div key={slug} className="rounded-2xl border p-4" style={{ borderColor: "var(--line-1)", background: "var(--surface-2)" }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{app?.name ?? slug} <span className="text-xs opacity-60">/{slug}</span></div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Padrão: {p?.base.priceLabel} · Prime {p?.prime.priceLabel}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost text-xs inline-flex items-center gap-1" onClick={() => onReset(slug)} disabled={!r}>
                    <RotateCcw size={12} /> Padrão
                  </button>
                  <button className="btn-primary text-xs inline-flex items-center gap-1" onClick={() => onSave(slug)} disabled={!isDirty || saving === slug}>
                    <Save size={12} /> {saving === slug ? "Salvando…" : "Salvar"}
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <fieldset className="rounded-lg border p-3" style={{ borderColor: "var(--line-1)" }}>
                  <legend className="px-1 text-xs font-medium">Base</legend>
                  <NumberField label="R$ / mês" value={r?.base_monthly ?? null} onChange={(v) => upd(slug, { base_monthly: v })} placeholder={String(p?.base.monthly ?? "")} />
                  <TextField label="Rótulo de preço" value={r?.base_price_label ?? ""} onChange={(v) => upd(slug, { base_price_label: v || null })} placeholder={p?.base.priceLabel} />
                  <TextField label="Tagline" value={r?.base_tagline ?? ""} onChange={(v) => upd(slug, { base_tagline: v || null })} placeholder={p?.base.tagline} />
                </fieldset>
                <fieldset className="rounded-lg border p-3" style={{ borderColor: "var(--line-1)" }}>
                  <legend className="px-1 text-xs font-medium">Prime (upsell)</legend>
                  <NumberField label="R$ / mês" value={r?.prime_monthly ?? null} onChange={(v) => upd(slug, { prime_monthly: v })} placeholder={String(p?.prime.monthly ?? "")} />
                  <TextField label="Rótulo de preço" value={r?.prime_price_label ?? ""} onChange={(v) => upd(slug, { prime_price_label: v || null })} placeholder={p?.prime.priceLabel} />
                  <TextField label="Tagline" value={r?.prime_tagline ?? ""} onChange={(v) => upd(slug, { prime_tagline: v || null })} placeholder={p?.prime.tagline} />
                </fieldset>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Config global + tabelas ---------- */

export function AdminConfigTab() {
  const loadSettings = useServerFn(getPlatformSettings);
  const upsert = useServerFn(adminUpsertSetting);
  const del = useServerFn(adminDeleteSetting);
  const loadCounts = useServerFn(adminTableCounts);

  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [counts, setCounts] = useState<{ table: string; count: number }[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  async function reload() {
    const [s, c] = await Promise.all([loadSettings(), loadCounts()]);
    setSettings(s);
    setCounts(c);
    const d: Record<string, string> = {};
    for (const row of s) d[row.key] = JSON.stringify(row.value, null, 2);
    setDrafts(d);
  }
  useEffect(() => { reload().catch(() => {}); }, []);

  async function onSave(key: string) {
    try {
      const parsed = JSON.parse(drafts[key] ?? "null");
      await upsert({ data: { key, value: parsed } });
      toast.success("Salvo.");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "JSON inválido");
    }
  }
  async function onDelete(key: string) {
    if (!confirm(`Remover setting ${key}?`)) return;
    await del({ data: { key } });
    toast.success("Removido.");
    await reload();
  }
  async function onCreate() {
    if (!newKey.trim()) return toast.error("Informe a chave");
    try {
      const parsed = JSON.parse(newVal || "null");
      await upsert({ data: { key: newKey.trim(), value: parsed } });
      setNewKey(""); setNewVal("");
      toast.success("Criado.");
      await reload();
    } catch (e: any) { toast.error(e?.message ?? "JSON inválido"); }
  }

  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-2xl border p-4" style={{ borderColor: "var(--line-1)", background: "var(--surface-1)" }}>
        <div className="text-sm font-medium">Configurações da plataforma</div>
        <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
          Chave/valor em JSON. Use para dias de trial, banners, feature flags, quotas de IA e qualquer parâmetro que precise mudar sem deploy.
        </p>
      </div>

      <div className="grid gap-3">
        {settings.map((s) => (
          <div key={s.key} className="rounded-2xl border p-4" style={{ borderColor: "var(--line-1)", background: "var(--surface-2)" }}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <code className="text-sm font-semibold">{s.key}</code>
                {s.description && <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.description}</div>}
              </div>
              <div className="flex gap-1">
                <button className="btn-primary text-xs inline-flex items-center gap-1" onClick={() => onSave(s.key)}>
                  <Save size={12} /> Salvar
                </button>
                <button className="btn-ghost text-xs inline-flex items-center gap-1" onClick={() => onDelete(s.key)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <textarea
              className="mt-2 w-full rounded-lg border p-2 font-mono text-xs"
              style={{ borderColor: "var(--line-1)", background: "var(--surface-1)", color: "var(--text-1)", minHeight: 80 }}
              value={drafts[s.key] ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: "var(--line-1)", background: "var(--surface-2)" }}>
        <div className="text-sm font-medium">+ Nova configuração</div>
        <div className="mt-2 grid gap-2 md:grid-cols-[1fr_2fr_auto]">
          <input className="rounded-lg border p-2 text-sm" style={{ borderColor: "var(--line-1)", background: "var(--surface-1)", color: "var(--text-1)" }}
            placeholder="chave" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <input className="rounded-lg border p-2 font-mono text-xs" style={{ borderColor: "var(--line-1)", background: "var(--surface-1)", color: "var(--text-1)" }}
            placeholder='valor JSON (ex.: {"enabled":true} ou "texto" ou 42)' value={newVal} onChange={(e) => setNewVal(e.target.value)} />
          <button className="btn-primary text-xs inline-flex items-center gap-1" onClick={onCreate}>
            <Plus size={12} /> Criar
          </button>
        </div>
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: "var(--line-1)", background: "var(--surface-1)" }}>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Database size={14} /> Tabelas do banco
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {counts.map((c) => (
            <div key={c.table} className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "var(--line-1)", background: "var(--surface-2)" }}>
              <code>{c.table}</code>
              <span className="font-semibold">{c.count.toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- inputs ---------- */

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="mt-2 block text-xs">
      <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border p-2 text-sm"
        style={{ borderColor: "var(--line-1)", background: "var(--surface-1)", color: "var(--text-1)" }}
      />
    </label>
  );
}
function NumberField({ label, value, onChange, placeholder }: { label: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <label className="mt-2 block text-xs">
      <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <input
        type="number"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="mt-1 w-full rounded-lg border p-2 text-sm"
        style={{ borderColor: "var(--line-1)", background: "var(--surface-1)", color: "var(--text-1)" }}
      />
    </label>
  );
}
