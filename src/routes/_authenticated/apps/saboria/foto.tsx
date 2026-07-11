import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { analyzePhoto, type PhotoResult } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Search, X, Camera } from "lucide-react";
import { PrimeGate } from "@/components/commerce/PrimeGate";

export const Route = createFileRoute("/_authenticated/apps/saboria/foto")({
  component: () => (
    <AppShell>
      <PrimeGate slug="saboria" feature="Foto → Receita">
        <FotoPage />
      </PrimeGate>
    </AppShell>
  ),
});

const CUISINES = ["🌍 Qualquer", "🇧🇷 Brasileira", "🇮🇹 Italiana", "🇯🇵 Japonesa", "🇲🇽 Mexicana"];

function FotoPage() {
  const call = useServerFn(analyzePhoto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState(CUISINES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhotoResult | null>(null);

  function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem maior que 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await call({ data: { imageBase64: image, cuisine } });
      setResult(r);
      if (r.error) toast.error(r.error);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao analisar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <ScreenHeader
        title="📸 Foto → Receita"
        subtitle="Tire foto de um prato e a IA identifica + gera a receita completa"
      />

      {/* Upload */}
      <div
        onClick={() => !image && inputRef.current?.click()}
        className="mb-4 flex flex-col items-center justify-center rounded-2xl p-10 text-center transition-colors"
        style={{
          border: image ? "1px solid var(--line-2)" : "2px dashed var(--line-1)",
          background: image ? "transparent" : "rgba(255,255,255,0.02)",
          cursor: image ? "default" : "pointer",
        }}
      >
        {image ? (
          <div className="relative">
            <img src={image} alt="Prato" className="max-h-72 rounded-xl" />
            <button
              onClick={() => {
                setImage(null);
                setResult(null);
              }}
              aria-label="Remover foto"
              className="absolute -right-2 -top-2 rounded-full p-1"
              style={{ background: "var(--bg-4)", border: "1px solid var(--line-2)" }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Camera size={48} style={{ color: "var(--text-2)" }} />
            <div className="mt-3 font-medium">Toque para tirar foto ou escolher imagem</div>
            <div className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
              Suporta JPG, PNG — até 10MB
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {/* Cuisines */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CUISINES.map((c) => (
          <button
            key={c}
            onClick={() => setCuisine(c)}
            className={`chip ${cuisine === c ? "chip-active" : "chip-neutral"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        className="btn-primary mb-6 w-full"
        onClick={analyze}
        disabled={!image || loading}
      >
        <Search size={16} /> {loading ? "Analisando..." : "Analisar com IA"}
      </button>

      {loading && <TypingIndicator label="Analisando imagem com IA..." />}

      {result && !result.error && !loading && (
        <div className="fade-up glass p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{result.identified}</h2>
              <div className="mt-1 text-xs" style={{ color: "var(--text-2)" }}>
                {result.origin}
              </div>
            </div>
            {typeof result.confidence === "number" && (
              <span className="chip">✓ {result.confidence}%</span>
            )}
          </div>
          {result.description && (
            <p className="mt-3 text-sm" style={{ color: "var(--text-2)" }}>
              {result.description}
            </p>
          )}

          {result.ingredients && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--brand-2)" }}>
                Ingredientes
              </h3>
              <ul className="space-y-1 text-sm">
                {result.ingredients.map((i, idx) => (
                  <li key={idx}>• {i}</li>
                ))}
              </ul>
            </div>
          )}

          {result.steps && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--brand-2)" }}>
                Modo de preparo
              </h3>
              <ol className="space-y-2">
                {result.steps.map((s, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "var(--brand)" }}
                    >
                      {idx + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.tip && (
            <div
              className="mt-5 rounded-xl p-4 text-sm"
              style={{
                background: "var(--brand-glow)",
                border: "1px solid var(--brand-glow)",
                color: "var(--text-1)",
              }}
            >
              💡 <strong style={{ color: "var(--brand-2)" }}>Dica do Chef:</strong> {result.tip}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
