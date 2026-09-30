import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Bell, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listNotifications, markNotificationRead } from "@/lib/agent.functions";

type N = {
  id: string; kind: string; app_slug: string | null; title: string;
  body: string | null; route: string | null; read_at: string | null; created_at: string;
};

export function NotificationBell() {
  const load = useServerFn(listNotifications);
  const mark = useServerFn(markNotificationRead);
  const [items, setItems] = useState<N[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try { setItems((await load()) as N[]); } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let uid: string | null = null;
    let ch: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data } = await supabase.auth.getUser();
      uid = data.user?.id ?? null;
      if (!uid) return;
      ch = supabase
        .channel(`notif:${uid}:${crypto.randomUUID()}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
          (payload) => setItems((prev) => [payload.new as N, ...prev].slice(0, 30)))
        .subscribe();
    })();
    return () => { if (ch) supabase.removeChannel(ch); };
  }, []);

  const unread = items.filter((i) => !i.read_at).length;

  async function markAll() {
    await mark({ data: { all: true } });
    setItems((prev) => prev.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() })));
  }
  async function markOne(id: string) {
    await mark({ data: { id } });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read_at: new Date().toISOString() } : i)));
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} title="Notificações"
        className="press relative flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: "var(--n-100)" }}>
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ background: "#ef4444" }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-[350px] max-h-[75vh] overflow-hidden rounded-2xl border border-border/70 bg-card/95 backdrop-blur-2xl shadow-2xl"
            style={{ boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.25)" }}>
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <div className="text-sm font-bold text-foreground">Central de Avisos</div>
              </div>
              {unread > 0 && (
                <button onClick={markAll} className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
                  <Check size={12} /> Marcar lidas
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/30">
              {loading && (
                <div className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin text-primary" /> Carregando notificações…
                </div>
              )}
              {!loading && items.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bell size={18} />
                  </div>
                  <div className="font-semibold text-foreground">Tudo em dia!</div>
                  <p className="mt-1 text-[11px]">Seu Concierge IA enviará notificações quando tiver sugestões para seus apps.</p>
                </div>
              )}
              {items.map((n) => {
                const inner = (
                  <div className={`p-3.5 text-sm transition-colors hover:bg-muted/40 ${!n.read_at ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {n.app_slug ?? n.kind}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <div className="mt-1 font-semibold text-foreground text-xs leading-snug">{n.title}</div>
                    {n.body && <div className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{n.body}</div>}
                  </div>
                );
                return n.route ? (
                  <Link key={n.id} to={n.route} onClick={() => { markOne(n.id); setOpen(false); }}>{inner}</Link>
                ) : (
                  <button key={n.id} onClick={() => markOne(n.id)} className="w-full text-left">{inner}</button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
