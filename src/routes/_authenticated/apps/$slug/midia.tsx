import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { findApp } from "@/apps/registry";
import { brandFor } from "@/lib/media-brand";
import { generateDocOutline, brandTTS } from "@/lib/media.functions";
import { Volume2, FileText, Presentation, Video, Download, Play, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import PptxGenJS from "pptxgenjs";

export const Route = createFileRoute("/_authenticated/apps/$slug/midia")({
  component: MediaHubPage,
});

type Tab = "audio" | "ebook" | "pptx" | "video";
type Outline = {
  title: string;
  subtitle?: string;
  sections: { heading: string; body: string; bullets?: string[] }[];
};

function MediaHubPage() {
  const { slug } = useParams({ from: "/_authenticated/apps/$slug/midia" });
  const app = findApp(slug);
  const brand = brandFor(slug);
  const [tab, setTab] = useState<Tab>("audio");

  return (
    <AppShell appSlug={slug}>
      <ScreenHeader
        title={`Hub de Mídia`}
        subtitle={`${app?.name ?? slug} · gere áudios, ebooks, apresentações e ideias de vídeo com voz de marca.`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {([
          { k: "audio", label: "Áudios", icon: Volume2 },
          { k: "ebook", label: "Ebooks", icon: FileText },
          { k: "pptx", label: "Slides", icon: Presentation },
          { k: "video", label: "Vídeos", icon: Video },
        ] as const).map((t) => {
          const active = tab === t.k;
          const Icon = t.icon;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className="press flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all"
              style={{
                background: active ? brand.color : "var(--n-100)",
                color: active ? "#fff" : "var(--n-500)",
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "audio" && <AudioTab slug={slug} />}
      {tab === "ebook" && <DocTab slug={slug} format="ebook" />}
      {tab === "pptx" && <DocTab slug={slug} format="pptx" />}
      {tab === "video" && <VideoTab slug={slug} />}
    </AppShell>
  );
}

/* ---------------- Áudios (TTS voz de marca) ---------------- */
function AudioTab({ slug }: { slug: string }) {
  const brand = brandFor(slug);
  const tts = useServerFn(brandTTS);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function generate() {
    if (!text.trim()) return toast.error("Escreva o roteiro do áudio.");
    setLoading(true);
    try {
      const r = await tts({ data: { text: text.trim(), voice: brand.voice, styleHint: brand.ttsStyle } });
      const url = `data:${r.mimeType};base64,${r.audioBase64}`;
      setAudioUrl(url);
      setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro na geração");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `nxa-${slug}-audio.mp3`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="surface p-4">
        <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--n-500)" }}>
          Voz de marca · <span className="font-semibold" style={{ color: brand.color }}>{brand.voice}</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva o texto do seu podcast, narração de reels ou lembrete de áudio…"
          rows={6}
          maxLength={3000}
          className="input-field w-full resize-none"
        />
        <div className="mt-2 flex items-center justify-between text-xs" style={{ color: "var(--n-500)" }}>
          <span>{text.length}/3000</span>
          <button
            onClick={generate}
            disabled={loading || !text.trim()}
            className="btn-primary rounded-full text-sm"
            style={{ background: brand.color }}
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> gerando…</> : <><Sparkles size={14} /> Gerar áudio</>}
          </button>
        </div>
      </div>

      {audioUrl && (
        <div className="surface p-4">
          <audio ref={audioRef} src={audioUrl} controls className="w-full" />
          <button onClick={download} className="mt-3 flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs hover:bg-muted/50">
            <Download size={12} /> Baixar MP3
          </button>
        </div>
      )}

      <SuggestionChips slug={slug} onPick={(t) => setText(t)} kind="audio" />
    </div>
  );
}

/* ---------------- Ebook & PPTX (outline por IA → arquivo) ---------------- */
function DocTab({ slug, format }: { slug: string; format: "ebook" | "pptx" }) {
  const brand = brandFor(slug);
  const genOutline = useServerFn(generateDocOutline);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<Outline | null>(null);

  async function generate() {
    if (!topic.trim()) return toast.error("Defina um tema.");
    setLoading(true);
    setOutline(null);
    try {
      const r = await genOutline({ data: { appSlug: slug, format, topic: topic.trim(), audience: audience.trim() || undefined } });
      setOutline(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  function exportPDF() {
    if (!outline) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin = 56;
    let y = margin;

    // capa colorida
    doc.setFillColor(brand.color);
    doc.rect(0, 0, W, 220, "F");
    doc.setTextColor("#ffffff");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(wrap(doc, outline.title, W - margin * 2), margin, 110);
    if (outline.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text(wrap(doc, outline.subtitle, W - margin * 2), margin, 155);
    }
    doc.setFontSize(10);
    doc.text("NXA Studio", margin, 200);
    y = 260;
    doc.setTextColor("#111111");

    outline.sections.forEach((s, i) => {
      if (y > H - 120) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(brand.color);
      const heading = `${i + 1}. ${s.heading}`;
      const hLines = wrap(doc, heading, W - margin * 2);
      doc.text(hLines, margin, y);
      y += 18 * hLines.length + 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor("#111111");
      const body = wrap(doc, s.body, W - margin * 2);
      doc.text(body, margin, y);
      y += 15 * body.length + 8;

      if (s.bullets?.length) {
        s.bullets.forEach((b) => {
          const bLines = wrap(doc, `•  ${b}`, W - margin * 2 - 12);
          if (y > H - 60) { doc.addPage(); y = margin; }
          doc.text(bLines, margin + 12, y);
          y += 14 * bLines.length + 3;
        });
      }
      y += 18;
    });

    doc.save(`nxa-${slug}-ebook.pdf`);
  }

  async function exportPPTX() {
    if (!outline) return;
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";

    // capa
    const cover = pptx.addSlide();
    cover.background = { color: brand.color.replace("#", "") };
    cover.addText(outline.title, { x: 0.6, y: 2.4, w: 12, h: 1.5, fontSize: 44, bold: true, color: "FFFFFF", fontFace: "Inter" });
    if (outline.subtitle) {
      cover.addText(outline.subtitle, { x: 0.6, y: 4.0, w: 12, h: 0.8, fontSize: 20, color: "FFFFFF", fontFace: "Inter" });
    }
    cover.addText("NXA Studio", { x: 0.6, y: 6.7, w: 6, h: 0.4, fontSize: 12, color: "FFFFFF" });

    outline.sections.forEach((s) => {
      const slide = pptx.addSlide();
      slide.background = { color: "FAFAFA" };
      slide.addShape("rect", { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: brand.color.replace("#", "") } });
      slide.addText(s.heading, { x: 0.8, y: 0.5, w: 12, h: 1, fontSize: 32, bold: true, color: "111111", fontFace: "Inter" });
      slide.addText(s.body, { x: 0.8, y: 1.7, w: 12, h: 1.5, fontSize: 18, color: "333333", fontFace: "Inter" });
      if (s.bullets?.length) {
        slide.addText(
          s.bullets.map((b) => ({ text: b, options: { bullet: { code: "25CF" } } })),
          { x: 0.8, y: 3.4, w: 12, h: 3.5, fontSize: 18, color: "111111", fontFace: "Inter", paraSpaceAfter: 8 }
        );
      }
    });

    await pptx.writeFile({ fileName: `nxa-${slug}-slides.pptx` });
  }

  const suggestions = useMemo(() => defaultTopics(slug, format), [slug, format]);

  return (
    <div className="space-y-4">
      <div className="surface p-4">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={format === "ebook" ? brand.ebookTitle + " – ex.: cardápio low-carb para 7 dias" : brand.pptxTitle + " – ex.: pitch para venda B2B"}
          className="input-field mb-2 w-full"
        />
        <input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Público-alvo (opcional): ex. mães, estudantes, iniciantes…"
          className="input-field w-full"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setTopic(s)} className="chip chip-neutral">{s}</button>
          ))}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary mt-3 rounded-full text-sm"
          style={{ background: brand.color }}
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> escrevendo…</> : <><Sparkles size={14} /> Gerar outline</>}
        </button>
      </div>

      {loading && <TypingIndicator label="Redigindo com voz de marca…" />}

      {outline && (
        <div className="surface p-5">
          <div className="mb-1 text-[11px] uppercase tracking-wider" style={{ color: "var(--n-500)" }}>
            Preview
          </div>
          <div className="text-2xl font-bold" style={{ color: brand.color }}>{outline.title}</div>
          {outline.subtitle && <div className="text-sm" style={{ color: "var(--n-500)" }}>{outline.subtitle}</div>}
          <div className="mt-4 space-y-4">
            {outline.sections.map((s, i) => (
              <div key={i}>
                <div className="text-sm font-semibold">{i + 1}. {s.heading}</div>
                <div className="text-[13px]" style={{ color: "var(--n-500)" }}>{s.body}</div>
                {s.bullets && (
                  <ul className="mt-1 list-disc pl-5 text-[13px]">
                    {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            {format === "ebook" ? (
              <button onClick={exportPDF} className="btn-primary rounded-full text-sm" style={{ background: brand.color }}>
                <Download size={14} /> Baixar PDF
              </button>
            ) : (
              <button onClick={exportPPTX} className="btn-primary rounded-full text-sm" style={{ background: brand.color }}>
                <Download size={14} /> Baixar PPTX
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Vídeos (biblioteca curada) ---------------- */
function VideoTab({ slug }: { slug: string }) {
  const brand = brandFor(slug);
  return (
    <div className="space-y-4">
      <div className="surface p-4 text-sm" style={{ color: "var(--n-500)" }}>
        Ideias de vídeo curadas para {brand.ebookTitle.includes("Cardápio") ? "cozinha" : "seu módulo"}. Toque para roteirizar o áudio no plano gratuito · geração automática de vídeo chega no <span className="font-semibold" style={{ color: brand.color }}>Pro</span>.
      </div>
      <div className="grid grid-cols-2 gap-3">
        {brand.videoLibrary.map((v) => (
          <div key={v.title} className="surface p-4">
            <div className="text-3xl">{v.emoji}</div>
            <div className="mt-2 text-sm font-semibold">{v.title}</div>
            <div className="text-[12px]" style={{ color: "var(--n-500)" }}>{v.hint}</div>
            <div className="mt-3 flex items-center justify-between">
              <button className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: brand.color, color: "#fff" }}>
                <Play size={11} /> roteirizar
              </button>
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--n-400)" }}>Pro</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuggestionChips({ slug, onPick, kind }: { slug: string; onPick: (t: string) => void; kind: "audio" }) {
  const brand = brandFor(slug);
  const list = brand.videoLibrary.slice(0, 4).map((v) => `${v.title}: ${v.hint}`);
  void kind;
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((s) => (
        <button key={s} onClick={() => onPick(`Olá! Hoje o assunto é ${s}. Vamos direto ao ponto: `)} className="chip chip-neutral">
          {s.split(":")[0]}
        </button>
      ))}
    </div>
  );
}

function defaultTopics(slug: string, format: "ebook" | "pptx"): string[] {
  const map: Record<string, string[]> = {
    saboria: ["Cardápio semanal low-carb", "Meal prep 7 dias fitness", "Receitas para air fryer", "Sobremesas fit"],
    socialia: ["30 posts para o mês", "Roteiro Reels de 30 seg", "Estratégia lançamento produto", "Storyselling"],
    petia: ["Guia do filhote 0-6 meses", "Cuidados com o pet idoso", "Alimentação natural balanceada", "Adestramento positivo"],
    fluencyia: ["100 frases essenciais em inglês", "Business English pro", "Preparação para IELTS", "Small talk que impressiona"],
    glowia: ["Rotina skincare completa", "Skincare para acne", "Anti-idade natural", "Rotina masculina"],
    granaia: ["Sair das dívidas em 90 dias", "Investir do zero", "Planejamento financeiro anual", "Renda extra online"],
    fitia: ["Treino em casa 12 semanas", "Hipertrofia iniciante", "Emagrecimento sustentável", "Mobilidade e postura"],
    styleia: ["Guarda-roupa cápsula", "Estilo profissional", "Cores que combinam", "Look para eventos"],
    cosmosia: ["Modelos de Redação Nota 1000", "Checklists de Física e Química", "Fórmulas de Matemática Básica", "Cronograma Reta Final ENEM"],
    roteiroia: ["Roteiro 7 dias Europa", "Fim de semana barato", "Viagem solo segura", "Roteiro família com crianças"],
  };
  const base = map[slug] ?? ["Introdução ao tema", "Guia prático completo", "Erros comuns a evitar", "Próximos passos"];
  void format;
  return base;
}

function wrap(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}
