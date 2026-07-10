import { motion } from "framer-motion";

/** Premium "AI is thinking" indicator — subtle, elegant, alive. */
export function AiThinking({ label = "IA pensando" }: { label?: string }) {
  return (
    <motion.div
      className="inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 glass-premium"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))",
            }}
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
      <span className="text-xs font-medium tracking-tight text-gradient">{label}</span>
    </motion.div>
  );
}
