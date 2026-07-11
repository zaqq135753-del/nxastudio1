type Props = { days: number; label?: string };

export function StreakBadge({ days, label }: Props) {
  if (days <= 0) return null;
  return (
    <span className="streak-flame" title={label ?? `${days} dias seguidos`}>
      <span className="flame" aria-hidden>🔥</span>
      <span>{days} {label ?? (days === 1 ? "dia" : "dias")}</span>
    </span>
  );
}
