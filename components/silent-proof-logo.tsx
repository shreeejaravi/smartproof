export function SilentProofLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SilentProof logo"
    >
      {/* Shield shape */}
      <path
        d="M32 4L8 16v16c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V16L32 4z"
        fill="hsl(222 47% 8%)"
        stroke="hsl(217 91% 60%)"
        strokeWidth="2"
      />
      {/* Sound wave bars - centered within shield */}
      <rect x="22" y="28" width="3" height="8" rx="1.5" fill="hsl(217 91% 60%)" opacity="0.6" />
      <rect x="27" y="22" width="3" height="20" rx="1.5" fill="hsl(217 91% 60%)" opacity="0.8" />
      <rect x="32" y="18" width="3" height="28" rx="1.5" fill="hsl(160 84% 39%)" />
      <rect x="37" y="22" width="3" height="20" rx="1.5" fill="hsl(217 91% 60%)" opacity="0.8" />
      <rect x="42" y="28" width="3" height="8" rx="1.5" fill="hsl(217 91% 60%)" opacity="0.6" />
    </svg>
  )
}
