import { useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";

/**
 * Wraps content and adds a floating "share as image" button.
 * Uses canvas + html2canvas dynamically to avoid bundle bloat.
 */
export function ShareableCard({ children, filename = "nxa-share.png", title }: { children: React.ReactNode; filename?: string; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function toImage(): Promise<string> {
    const node = ref.current!;
    // Simple foreignObject-based capture (no extra deps)
    const rect = node.getBoundingClientRect();
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    const clone = node.cloneNode(true) as HTMLElement;
    // Inline computed styles (best-effort)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;font-family:Inter,system-ui,sans-serif;">
          ${clone.outerHTML}
        </div>
      </foreignObject>
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    return URL.createObjectURL(blob);
  }

  async function download() {
    setBusy(true);
    try {
      const url = await toImage();
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally { setBusy(false); }
  }

  async function share() {
    if (!navigator.share) return download();
    setBusy(true);
    try {
      const url = await toImage();
      const res = await fetch(url); const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/svg+xml" });
      await navigator.share({ files: [file], title: title ?? "NXA Studio" });
    } catch { /* cancelled */ }
    finally { setBusy(false); }
  }

  return (
    <div className="relative">
      <div ref={ref}>{children}</div>
      <div className="mt-3 flex gap-2 justify-end">
        <button onClick={download} disabled={busy}
          className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs hover:bg-muted/50 disabled:opacity-50">
          <Download className="h-3.5 w-3.5" /> Baixar
        </button>
        <button onClick={share} disabled={busy}
          className="flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs hover:opacity-90 disabled:opacity-50">
          <Share2 className="h-3.5 w-3.5" /> Compartilhar
        </button>
      </div>
    </div>
  );
}
