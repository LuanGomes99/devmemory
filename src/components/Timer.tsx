interface TimerProps {
  remainingMs: number
  limitMs: number
  running: boolean
}

const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Faixas de urgência:
 *  > 30 s  normal (acento azul)
 *  30–15 s âmbar, discreto
 *  < 15 s  vermelho de alerta
 *  ≤ 5 s   pulsação
 */
export function Timer({ remainingMs, limitMs, running }: TimerProps) {
  const seconds = Math.ceil(remainingMs / 1000)
  const tone = seconds > 30 ? 'normal' : seconds > 15 ? 'warn' : 'danger'
  const pulse = running && seconds <= 5 && remainingMs > 0
  const offset = CIRCUMFERENCE * (1 - remainingMs / limitMs)

  return (
    <div
      className="timer relative aspect-square size-16 shrink-0 lg:size-40 short:size-20"
      data-tone={tone}
      data-pulse={String(pulse)}
      role="timer"
      aria-label={`${seconds} segundos restantes`}
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--color-line)" strokeWidth="6" />
        <circle
          className="timer-ring"
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
        <span className="timer-value flex items-baseline font-mono font-semibold tabular-nums leading-none tracking-tight">
          <span className="text-xl lg:text-5xl short:text-2xl">{seconds}</span>
          <span className="ml-px text-[0.6rem] text-muted lg:text-base short:text-xs">s</span>
        </span>
      </div>
    </div>
  )
}
