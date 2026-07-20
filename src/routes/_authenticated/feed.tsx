import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { 
  listFeed, 
  toggleLike, 
  createFeedPost, 
  deleteFeedPost, 
  addComment, 
  listComments,
  type FeedPost,
  type FeedComment
} from "@/lib/feed.functions";
import { getLeaderboard, getMyXp, xpForNextLevel, type XpRow } from "@/lib/gamification.functions";
import { 
  Heart, 
  Trash2, 
  Send, 
  Trophy, 
  Flame, 
  Sparkles, 
  MessageSquare, 
  Image as ImageIcon,
  MoreHorizontal,
  Share2,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { APPS } from "@/apps/registry";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

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
  const [meProfile, setMeProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  // compose
  const [appSlug, setAppSlug] = useState("saboria");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [posting, setPosting] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setMeId(data.user?.id ?? null);
      if (data.user?.id) {
        supabase.from("profiles")
          .select("display_name, avatar_url")
          .eq("id", data.user.id)
          .single()
          .then(({ data: prof }) => setMeProfile(prof));
      }
    });
    load().then(setPosts).catch(() => setPosts([]));
    loadLb().then(setLb).catch(() => {});
    loadXp().then(setXp).catch(() => {});
  }, [load, loadLb, loadXp]);

  async function submit() {
    if (!title.trim() || posting) return;
    setPosting(true);
    try {
      await create({ 
        data: { 
          app_slug: appSlug, 
          title: title.trim(), 
          body: body.trim() || undefined,
          media_url: mediaUrl || undefined,
          kind: mediaUrl ? "media" : "share"
        } 
      });
      setTitle(""); setBody(""); setMediaUrl(""); setShowMediaInput(false);
      const [p, x] = await Promise.all([load(), loadXp()]);
      setPosts(p); setXp(x);
      toast.success("Experiência compartilhada! Conquistas desbloqueadas.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally { setPosting(false); }
  }

  async function onLike(id: string) {
    setPosts(prev => prev?.map(p => p.id === id ? { 
      ...p, 
      liked_by_me: !p.liked_by_me, 
      likes_count: p.likes_count + (p.liked_by_me ? -1 : 1) 
    } : p) ?? null);
    try { await like({ data: { post_id: id } }); } catch { load().then(setPosts); }
  }

  async function onDelete(id: string) {
    if (!confirm("Remover esta publicação da rede?")) return;
    await del({ data: { id } });
    setPosts(prev => prev?.filter(p => p.id !== id) ?? null);
    toast.success("Publicação removida.");
  }

  const pct = xp ? Math.min(100, Math.round((xp.total_xp / xp.next) * 100)) : 0;

  return (
    <AppShell>
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
          
          {/* Left Sidebar: Profile & Level */}
          <aside className="hidden lg:block space-y-4">
            <div className="surface overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-orange-400 to-rose-500 opacity-80" />
              <div className="px-4 pb-4 -mt-8 text-center">
                <div className="mx-auto h-16 w-16 rounded-xl border-4 border-card bg-card overflow-hidden shadow-sm">
                  {meProfile?.avatar_url ? (
                    <img src={meProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-orange-50 text-orange-600 font-bold text-xl">
                      {(meProfile?.display_name?.[0] ?? "U").toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="mt-2 font-bold text-base truncate">{meProfile?.display_name ?? "Explorador NXA"}</h3>
                <p className="text-xs text-muted-foreground">Premium Member</p>
                
                <div className="mt-4 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold">Nível {xp?.level ?? 1}</span>
                    <span className="text-muted-foreground">{xp?.total_xp ?? 0} XP</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className="h-full bg-orange-500" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="surface p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Menu</h4>
              <nav className="space-y-1">
                <Link to="/hub" className="flex items-center gap-3 px-2 py-2 text-sm rounded-lg hover:bg-secondary transition-colors">
                  🏠 Hub Principal
                </Link>
                <Link to="/admin" className="flex items-center gap-3 px-2 py-2 text-sm rounded-lg hover:bg-secondary transition-colors">
                  🛡️ Admin Panel
                </Link>
                <Link to="/feed" className="flex items-center gap-3 px-2 py-2 text-sm rounded-lg bg-orange-50 text-orange-600 font-medium">
                  🌐 Rede Global
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="space-y-4">
            {/* Professional Post Composer */}
            <div className="surface p-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex-shrink-0 flex items-center justify-center text-orange-600 font-bold">
                   {meProfile?.avatar_url ? <img src={meProfile.avatar_url} className="h-full w-full rounded-lg object-cover" /> : (meProfile?.display_name?.[0] ?? "U").toUpperCase()}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <select 
                      value={appSlug} 
                      onChange={e => setAppSlug(e.target.value)} 
                      className="text-xs bg-secondary border-none rounded-full px-3 py-1 outline-none font-medium text-muted-foreground focus:ring-1 ring-orange-200"
                    >
                      {APPS.map(a => <option key={a.slug} value={a.slug}>{a.name}</option>)}
                    </select>
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={10} /> +15 XP
                    </span>
                  </div>
                  <input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="O que você realizou hoje com a NXA?" 
                    className="w-full bg-transparent font-semibold text-lg outline-none placeholder:text-muted-foreground/50" 
                  />
                  <textarea 
                    value={body} 
                    onChange={e => setBody(e.target.value)} 
                    placeholder="Descreva detalhes, insights ou resultados da IA..." 
                    className="w-full bg-transparent text-sm outline-none resize-none min-h-[60px]" 
                  />
                  
                  {showMediaInput && (
                    <input 
                      value={mediaUrl} 
                      onChange={e => setMediaUrl(e.target.value)} 
                      placeholder="Cole a URL de uma imagem ou vídeo..." 
                      className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-xs outline-none border border-orange-100" 
                    />
                  )}

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowMediaInput(!showMediaInput)}
                        className={`p-2 rounded-lg transition-colors ${showMediaInput ? 'bg-orange-100 text-orange-600' : 'hover:bg-secondary text-muted-foreground'}`}
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                        <Share2 size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={submit} 
                      disabled={posting || !title.trim()} 
                      className="btn-primary rounded-full px-6 py-2 text-sm font-bold shadow-md shadow-orange-200"
                    >
                      {posting ? "Publicando..." : "Compartilhar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts === null ? (
                <div className="py-12 flex justify-center"><TypingIndicator label="Sincronizando feed..." /></div>
              ) : posts.length === 0 ? (
                <div className="surface p-12 text-center text-muted-foreground bg-secondary/30">
                  <Sparkles size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">O feed está silencioso.</p>
                  <p className="text-xs mt-1">Seja o primeiro a compartilhar uma conquista!</p>
                </div>
              ) : (
                posts.map(p => (
                  <PostCard 
                    key={p.id} 
                    post={p} 
                    meId={meId} 
                    onLike={() => onLike(p.id)} 
                    onDelete={() => onDelete(p.id)} 
                  />
                ))
              )}
            </div>
          </main>

          {/* Right Sidebar: Trends & Leaderboard */}
          <aside className="hidden lg:block space-y-4">
            <div className="surface p-4">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-orange-500" /> Líderes da Semana
              </h3>
              <div className="space-y-4">
                {lb.slice(0, 5).map((r, i) => (
                  <div key={r.user_id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden border border-border/50">
                        {r.avatar_url ? <img src={r.avatar_url} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-xs font-bold">{(r.display_name?.[0] ?? "U").toUpperCase()}</div>}
                      </div>
                      <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-slate-300' : i === 2 ? 'bg-orange-400' : 'bg-secondary text-muted-foreground'}`}>
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{r.display_name ?? "Anônimo"}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Flame size={10} className="text-orange-500" /> {r.total_xp} XP</span>
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-[9px] font-bold">Lvl {r.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-[11px] font-bold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                Ver ranking completo
              </button>
            </div>

            <div className="surface p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Dicas de Especialista</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <p className="text-[11px] leading-relaxed text-orange-800">
                    💡 <strong>Dica:</strong> Posts com mídia gerada por IA (fotos/vídeos) rendem <strong>+25 XP</strong> em vez de 15.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function PostCard({ post, meId, onLike, onDelete }: { post: FeedPost, meId: string | null, onLike: () => void, onDelete: () => void }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const loadCommentsFn = useServerFn(listComments);
  const addCommentFn = useServerFn(addComment);

  const app = APPS.find(a => a.slug === post.app_slug);

  async function toggleComments() {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const data = await loadCommentsFn({ data: { post_id: post.id } });
        setComments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  }

  async function handleSubmitComment() {
    if (!newComment.trim() || postingComment) return;
    setPostingComment(true);
    try {
      const comment = await addCommentFn({ data: { post_id: post.id, content: newComment.trim() } });
      setComments([...comments, comment]);
      setNewComment("");
      toast.success("Comentário enviado!");
    } catch (e) {
      toast.error("Erro ao comentar");
    } finally {
      setPostingComment(false);
    }
  }

  return (
    <article className="surface overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <header className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden border border-border/40 flex-shrink-0">
               {post.author_avatar ? <img src={post.author_avatar} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-xs font-bold">{(post.author_name?.[0] ?? "U").toUpperCase()}</div>}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm">{post.author_name ?? "Explorador NXA"}</h4>
                {post.user_id === 'super-admin-id' && <CheckCircle2 size={12} className="text-blue-500" fill="currentColor" />}
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                Utilizando <span className="font-semibold text-orange-600">{app?.name ?? post.app_slug}</span> • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {meId === post.user_id && (
              <button onClick={onDelete} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
            <button className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        <div className="mt-4 space-y-2">
          <h3 className="font-bold text-base leading-tight">{post.title}</h3>
          {post.body && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.body}</p>}
        </div>

        {post.media_url && (
          <div className="mt-4 rounded-xl overflow-hidden border border-border/40 bg-secondary/20">
            <img 
              src={post.media_url} 
              alt="Mídia da conquista" 
              className="w-full max-h-[450px] object-cover hover:scale-[1.01] transition-transform duration-500" 
              loading="lazy"
            />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={onLike}
              className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full transition-colors ${post.liked_by_me ? 'text-rose-500 bg-rose-50' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              <Heart size={16} fill={post.liked_by_me ? "currentColor" : "none"} />
              {post.likes_count > 0 && post.likes_count}
            </button>
            <button 
              onClick={toggleComments}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground px-2 py-1 rounded-full hover:bg-secondary transition-colors"
            >
              <MessageSquare size={16} />
              Comentar
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-muted-foreground hover:text-orange-600 rounded-full hover:bg-orange-50">
              <Bookmark size={16} />
            </button>
            <button className="p-1.5 text-muted-foreground hover:text-orange-600 rounded-full hover:bg-orange-50">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-secondary/20 border-t border-border/40 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Comment Input */}
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-orange-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-orange-600">
                   M
                </div>
                <div className="flex-1 relative">

                  <input 
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="w-full bg-card border border-border/60 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 ring-orange-200 pr-10"
                    onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                  />
                  <button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || postingComment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-600 disabled:opacity-30"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {loadingComments ? (
                  <div className="text-center py-4"><TypingIndicator label="Carregando..." /></div>
                ) : comments.length === 0 ? (
                  <p className="text-[10px] text-center text-muted-foreground py-2">Sem comentários ainda. Seja o primeiro!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-2">
                      <div className="h-6 w-6 rounded-md bg-secondary flex-shrink-0 flex items-center justify-center text-[8px] font-bold overflow-hidden border border-border/30">
                        {c.author_avatar ? <img src={c.author_avatar} className="h-full w-full object-cover" /> : (c.author_name?.[0] ?? "U").toUpperCase()}
                      </div>
                      <div className="bg-card px-3 py-2 rounded-2xl rounded-tl-none border border-border/40 max-w-[85%] shadow-sm">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold">{c.author_name ?? "Membro"}</span>
                          <span className="text-[8px] text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _keepImport = xpForNextLevel;