/**
 * NXA wordmark — monogram "N×" glyph + wordmark.
 * Scales with fontSize; inherits color.
 */
export function NxaMark({ size = 22, showWord = true }: { size?: number; showWord?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 leading-none">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <defs>
          <linearGradient id="nxa-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#nxa-g)" opacity="0.08" />
        <rect x="1" y="1" width="30" height="30" rx="9" stroke="currentColor" strokeOpacity="0.18" />
        {/* N */}
        <path d="M8 23 V9 L18 21 V9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* × dot accent */}
        <circle cx="24" cy="10.5" r="1.9" fill="currentColor" />
      </svg>
      {showWord && (
        <span className="font-bold tracking-[-0.02em]" style={{ fontSize: size * 0.78 }}>
          NXA<span style={{ opacity: 0.55, fontWeight: 500 }}> Studio</span>
        </span>
      )}
    </span>
  );
}
