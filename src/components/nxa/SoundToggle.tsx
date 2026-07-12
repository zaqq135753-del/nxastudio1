import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundEnabled, setSoundEnabled, beep } from "@/lib/feedback";

export function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(isSoundEnabled()); }, []);
  return (
    <button
      type="button"
      onClick={() => {
        const next = !on;
        setOn(next);
        setSoundEnabled(next);
        if (next) beep("success");
      }}
      title={on ? "Sons ativados" : "Sons desativados"}
      aria-pressed={on}
      className="press hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--n-100)]"
      style={{ color: "var(--muted-foreground)" }}
    >
      {on ? <Volume2 size={14} /> : <VolumeX size={14} />}
    </button>
  );
}
