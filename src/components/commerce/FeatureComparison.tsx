import { Check, Minus } from "lucide-react";
import type { AppPricing } from "@/apps/pricing";
import { PrimeBadge } from "./PrimeBadge";

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check size={16} className="mx-auto text-emerald-300" strokeWidth={2.5} />;
  if (v === false) return <Minus size={16} className="mx-auto text-white/25" />;
  return <span className="text-white/80">{v}</span>;
}

export function FeatureComparison({ pricing }: { pricing: AppPricing }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-5 py-3 text-xs uppercase tracking-wider text-white/50">Recurso</th>
            <th className="px-5 py-3 text-center text-xs uppercase tracking-wider text-white/50">Base</th>
            <th className="px-5 py-3 text-center text-xs uppercase tracking-wider text-white/50">
              <span className="inline-flex items-center gap-1.5">Prime <PrimeBadge /></span>
            </th>
          </tr>
        </thead>
        <tbody>
          {pricing.compare.map((row, i) => (
            <tr key={row.feature} className={i % 2 ? "bg-white/[0.015]" : ""}>
              <td className="px-5 py-3 text-white/85">{row.feature}</td>
              <td className="px-5 py-3 text-center"><Cell v={row.base} /></td>
              <td className="px-5 py-3 text-center"><Cell v={row.prime} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
