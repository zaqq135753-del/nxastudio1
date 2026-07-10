import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { listFeed, toggleLike, createFeedPost, deleteFeedPost, type FeedPost } from "@/lib/feed.functions";
import { getLeaderboard, getMyXp, xpForNextLevel, type XpRow } from "@/lib/gamification.functions";
import { Heart, Trash2, Send, Trophy, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { APPS } from "@/apps/registry";

export const Route = createFileRoute("/_authenticated/feed")({
  component: FeedPage,
});

function FeedPage() {
  const load = useServerFn(listFeed);
  const like = useServerFn(toggleLike);
  const del = useServerFn(deleteFeedPost);
  const create = useServerFn(createFeedPost);
  const loadLb = useServerFn(getLeaderboard);
  const loadXp = useServerFn(getMyXp);

  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [lb, setLb] = useState<XpRow[]>([]);
  const [xp, setXp] = useState<{ total_xp: number; level: number; next: number } | null>(null);
  const [meId, setMeId] = useState<string | null>(null);

  // compose
  const [appSlug, setAppSlug] = useState("saboria");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null));
    load().then(setPosts).catch(() => setPosts([]));
    loadLb().then(setLb).catch(() => {});
    loadXp().then(setXp).catch(() => {});
  }, [load, loadLb, loadXp]);

  async function submit() {
    if (!title.trim() || posting) return;
    setPosting(true);
    try {
      await create({ data: { app_slug: appSlug, title: title.trim(), body: body.trim() || undefined } });
      setTitle(""); setBody("");
      const [p, x] = await Promise.all([load(), loadXp()]);
      setPosts(p); setXp(x);
      toast.success("Publicado! +15 XP");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally { setPosting(false); }
  }

  async function onLike(id: string) {
    setPosts(prev => prev?.map(p => p.id === id ? { ...p, liked_by_me: !p.liked_by_me, likes_count: p.likes_count + (p.liked_by_me ? -1 : 1) } : p) ?? null);
    try { await like({ data: { post_id: id } }); } catch { load().then(setPosts); }
  }
  async function onDelete(id: string) {
    if (!confirm("Apagar post?")) return;
    await del({ data: { id } });
    setPosts(prev => prev?.filter(p => p.id !== id) ?? null);
  }

  const pct = xp ? Math.min(100, Math.round((xp.total_xp / xp.next) * 100)) : 0;

  return (
    <AppShell>
      <ScreenHeader title="Feed NXA" subtitle="Compartilhe conquistas. Ganhe XP. Suba de nível." />

      {/* XP & level card */}
      {xp && (
        <div className="surface p-4 mb-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold" style={{ background: "var(--c-orange)", color: "#fff" }}>
            {xp.level}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Nível {xp.level}</span>
              <span style={{ color: "var(--n-500)" }}>{xp.total_xp} / {xp.next} XP</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--n-100)" }}>
              <div className="h-full transition-all" style={{ width: `${pct}%`, background: "var(--c-orange)" }} />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div>
          {/* Compose */}
          <div className="surface p-4 mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <select value={appSlug} onChange={e => setAppSlug(e.target.value)} className="rounded-full px-3 py-1.5 text-xs" style={{ background: "var(--n-100)" }}>
                {APPS.map(a => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>
              <span className="chip"><Sparkles size={11} /> +15 XP</span>
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da conquista…" className="w-full bg-transparent border-b py-1.5 text-sm outline-none" style={{ borderColor: "var(--line-1)" }} />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Conta como foi (opcional)…" rows={2} className="w-full bg-transparent text-sm outline-none resize-none" />
            <div className="flex justify-end">
              <button onClick={submit} disabled={posting || !title.trim()} className="btn-primary inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs">
                <Send size={12} /> Publicar
              </button>
            </div>
          </div>

          {/* Posts */}
          {posts === null ? <TypingIndicator label="carregando…" /> : posts.length === 0 ? (
            <div className="surface p-6 text-center text-sm" style={{ color: "var(--n-500)" }}>
              Ainda sem posts. Seja o primeiro a compartilhar.
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(p => (
                <article key={p.id} className="surface p-4">
                  <header className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-semibold" style={{ background: "var(--n-100)", color: "var(--c-orange)" }}>
                      {p.author_avatar ? <img src={p.author_avatar} alt="" className="h-full w-full object-cover" /> : (p.author_name?.[0] ?? "U").toUpperCase()}
                    </div>
                    <div className="text-xs">
                      <div className="font-medium">{p.author_name ?? "Usuário NXA"}</div>
                      <div style={{ color: "var(--n-500)" }}>{p.app_slug} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                    </div>
                    {meId === p.user_id && (
                      <button onClick={() => onDelete(p.id)} className="ml-auto text-xs" style={{ color: "var(--n-500)" }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </header>
                  <h3 className="font-semibold text-[15px]">{p.title}</h3>
                  {p.body && <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: "var(--n-500)" }}>{p.body}</p>}
                  {p.media_url && <img src={p.media_url} alt="" className="mt-2 rounded-xl w-full object-cover max-h-80" />}
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => onLike(p.id)} className="press inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs" style={{ background: p.liked_by_me ? "var(--c-orange)" : "var(--n-100)", color: p.liked_by_me ? "#fff" : "var(--n-500)" }}>
                      <Heart size={12} fill={p.liked_by_me ? "currentColor" : "none"} /> {p.likes_count}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <aside className="surface p-4 h-fit sticky top-20">
          <h3 className="font-semibold text-sm inline-flex items-center gap-1.5"><Trophy size={14} /> Top XP</h3>
          <ol className="mt-3 space-y-2">
            {lb.length === 0 && <li className="text-xs" style={{ color: "var(--n-500)" }}>Sem dados ainda.</li>}
            {lb.map((r, i) => (
              <li key={r.user_id} className={`flex items-center gap-2 text-xs ${r.user_id === meId ? "font-semibold" : ""}`}>
                <span className="w-5 text-right" style={{ color: "var(--n-500)" }}>{i + 1}</span>
                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-[10px]" style={{ background: "var(--n-100)", color: "var(--c-orange)" }}>
                  {r.avatar_url ? <img src={r.avatar_url} alt="" className="h-full w-full object-cover" /> : (r.display_name?.[0] ?? "U").toUpperCase()}
                </div>
                <span className="flex-1 truncate">{r.display_name ?? "Anônimo"}</span>
                <span className="inline-flex items-center gap-0.5" style={{ color: "var(--c-orange)" }}><Flame size={10} /> {r.total_xp}</span>
                <span className="chip !py-0 !px-1.5 text-[10px]">L{r.level}</span>
              </li>
            ))}
          </ol>
          <Link to="/hub" className="mt-4 block text-center text-xs" style={{ color: "var(--n-500)" }}>← voltar ao hub</Link>
        </aside>
      </div>
    </AppShell>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _keepImport = xpForNextLevel;
