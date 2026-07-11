type Props = {
  value: number;   // 0..max
  max?: number;    // default 100
  label?: string;
  hint?: string;
};

export function XPProgressBar({ value, max = 100, label, hint }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full">
      {(label || hint) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-[12px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>}
          {hint && <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{hint}</span>}
        </div>
      )}
      <div className="xp-bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
