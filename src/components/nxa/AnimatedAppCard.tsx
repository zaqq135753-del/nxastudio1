import { Link } from "@tanstack/react-router";
import { useRef, type CSSProperties, type MouseEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { getAppVisual, appThemeClass } from "@/apps/visual";
import { PrimeBadge } from "@/components/commerce/PrimeBadge";

type Props = {
  slug: string;
  name: string;
  to: string;
  cover?: string;
  hook?: string;
  isPrime?: boolean;
  status?: "active" | "locked" | "soon" | "trial";
  onClick?: () => void;
  price?: string;
};

const STATUS_LABEL: Record<NonNullable<Props["status"]>, string> = {
  active: "",
  trial: "Trial",
  locked: "Não assinado",
  soon: "Em breve",
};

/**
 * Card de app com identidade por nicho: borda com gradiente do app,
 * bolha de emoji, cover com zoom no hover, badge, seta animada,
 * cursor-glow e tilt 3D sutil (Onda A).
 */
export function AnimatedAppCard({
  slug, name, to, cover, hook, isPrime, status = "active", onClick, price,
}: Props) {
  const v = getAppVisual(slug);
  const themeClass = appThemeClass(slug);
  const statusLabel = status !== "active" ? STATUS_LABEL[status] : "";
  const ref = useRef<HTMLDivElement | null>(null);

  function handleMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    // tilt: ±5deg
    const rx = ((x / rect.width) - 0.5) * 8;
    const ry = -((y / rect.height) - 0.5) * 6;
    el.style.setProperty("--mx", `${px}%`);
    el.style.setProperty("--my", `${py}%`);
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
  }
  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  const body = (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`${themeClass} card-cursor group relative flex h-44 flex-col justify-between overflow-hidden rounded-[23px] p-4 text-white`}
      style={{ ["--tile-img" as string]: cover ? `url(${cover})` : undefined } as CSSProperties}
    >
      {cover && (
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: `var(--tile-img)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--app-a) 22%, rgba(6,6,10,0.35)) 0%, color-mix(in oklab, var(--app-b) 18%, rgba(6,6,10,0.72)) 100%)",
        }}
      />
      <div className="relative flex items-start justify-between">
        <div className="app-icon-bubble" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)" }}>
          <span aria-hidden>{v?.emoji ?? "✨"}</span>
        </div>
        {isPrime ? <PrimeBadge /> : statusLabel && (
          <span className="rounded-full bg-white/18 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
            {statusLabel}
          </span>
        )}
      </div>
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="text-[17px] font-semibold tracking-tight">{name}</div>
          <ArrowUpRight size={14} className="arrow-slide opacity-80" />
        </div>
        {hook && <div className="mt-1 text-[12.5px] text-white/80 line-clamp-2">{hook}</div>}
        {price && (
          <div className="mt-2 text-[11px] font-medium text-white/70">{price}</div>
        )}
      </div>
    </div>
  );

  const wrapperClass = "card-app-border press block";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${wrapperClass} text-left w-full`}>
        {body}
      </button>
    );
  }

  return (
    <Link to={to} className={wrapperClass}>
      {body}
    </Link>
  );
}

