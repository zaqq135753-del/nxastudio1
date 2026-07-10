import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrimeBadge({ className, size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  const isMd = size === "md";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider",
        "border border-amber-400/40 text-amber-200",
        "bg-[linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,146,60,0.10))]",
        "shadow-[0_0_0_1px_rgba(251,191,36,0.15)_inset]",
        isMd ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]",
        className,
      )}
    >
      <Sparkles size={isMd ? 12 : 10} strokeWidth={2.5} />
      Prime
    </span>
  );
}
