import type { ReactNode } from "react";

type Props = {
  kicker?: string;
  title: string;
  action?: ReactNode;
  className?: string;
};

/** Cabeçalho de seção editorial: kicker uppercase + título + ação opcional. */
export function SectionHeader({ kicker, title, action, className }: Props) {
  return (
    <div className={`mb-4 flex items-end justify-between gap-4 ${className ?? ""}`}>
      <div className="min-w-0">
        {kicker && <div className="section-kicker mb-1">{kicker}</div>}
        <h2 className="section-title truncate">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
