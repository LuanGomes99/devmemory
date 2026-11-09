export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect
        x="3"
        y="6"
        width="17"
        height="22"
        rx="4"
        fill="var(--color-raised)"
        stroke="var(--color-line-strong)"
        strokeWidth="1.5"
        transform="rotate(-8 11.5 17)"
      />
      <rect x="12" y="4" width="17" height="22" rx="4" fill="var(--color-accent)" />
      <path
        d="M18.2 11.5 15.4 15l2.8 3.5M22.8 11.5l2.8 3.5-2.8 3.5"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
