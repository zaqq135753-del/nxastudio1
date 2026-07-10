import { useEffect, useState } from "react";

const THEMES = [
  { id: "light", label: "Light", color: "#fafaf9" },
  { id: "paper", label: "Paper", color: "#f6f4ee" },
  { id: "dark",  label: "Dark",  color: "#111111" },
] as const;

export type ThemeId = typeof THEMES[number]["id"];

export function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute("data-theme", id);
  try { localStorage.setItem("saboria.theme", id); } catch {}
}

export function useInitTheme() {
  useEffect(() => {
    try {
      const saved = (localStorage.getItem("saboria.theme") as ThemeId | null) ?? "coral";
      applyTheme(saved);
    } catch { applyTheme("coral"); }
  }, []);
}

export function ThemePicker() {
  const [active, setActive] = useState<ThemeId>("coral");
  useEffect(() => {
    try {
      const saved = (localStorage.getItem("saboria.theme") as ThemeId | null) ?? "coral";
      setActive(saved);
      applyTheme(saved);
    } catch {}
  }, []);

  return (
    <div className="flex items-center gap-3">
      <span className="edition-tag">Tema</span>
      <div className="flex items-center gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            aria-label={`Tema ${t.label}`}
            title={t.label}
            data-active={active === t.id}
            onClick={() => { setActive(t.id); applyTheme(t.id); }}
            className="theme-swatch"
            style={{ background: t.color }}
          />
        ))}
      </div>
    </div>
  );
}
