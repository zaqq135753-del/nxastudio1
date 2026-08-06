import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("nxa_theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("nxa_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  return (
    <button
      onClick={toggleTheme}
      className="press flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
      style={{ background: "var(--n-100)", color: "var(--foreground)" }}
      title={`Alternar para modo ${theme === "light" ? "escuro" : "claro"}`}
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
    </button>
  );
}
