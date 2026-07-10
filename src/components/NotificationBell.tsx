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
          <div className="absolute right-0 top-11 z-50 w-[340px] max-h-[70vh] overflow-hidden rounded-2xl border glass"
            style={{ borderColor: "var(--line-1)", boxShadow: "var(--shadow-elev)" }}>
            <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "var(--line-1)" }}>
              <div className="text-sm font-semibold">Notificações</div>
              {unread > 0 && (
                <button onClick={markAll} className="text-[11px] opacity-70 hover:opacity-100 inline-flex items-center gap-1">
                  <Check size={11} /> marcar tudo
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="flex items-center gap-2 p-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <Loader2 size={12} className="animate-spin" /> carregando…
                </div>
              )}
              {!loading && items.length === 0 && (
                <div className="p-6 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Sem notificações ainda. O Concierge IA vai te avisar quando tiver uma sugestão.
                </div>
              )}
              {items.map((n) => {
                const inner = (
                  <div className={`border-b px-4 py-3 text-sm ${!n.read_at ? "bg-[var(--n-50,rgba(0,0,0,0.02))]" : ""}`}
                    style={{ borderColor: "var(--line-1)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                        {n.app_slug ?? n.kind}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 font-medium">{n.title}</div>
                    {n.body && <div className="mt-0.5 text-[12px]" style={{ color: "var(--muted-foreground)" }}>{n.body}</div>}
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
