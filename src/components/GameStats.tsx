import type { ReactNode } from 'react'
import { LogOut, RotateCcw } from 'lucide-react'
import { PAIR_COUNT, TIME_LIMIT_MS } from '../hooks/useMemoryGame'
import { ProgressBar } from './ProgressBar'
import { Timer } from './Timer'

interface GameStatsProps {
  player: string
  remainingMs: number
  running: boolean
  pairsFound: number
  moves: number
  onRestart: () => void
  onExit: () => void
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted lg:text-sm">{label}</dt>
      <dd className="mt-0.5 font-mono text-lg font-semibold tabular-nums leading-none lg:mt-1.5 lg:text-3xl short:text-xl">
        {value}
        {suffix && <span className="text-muted">{suffix}</span>}
      </dd>
    </div>
  )
}

export function GameStats({
  player,
  remainingMs,
  running,
  pairsFound,
  moves,
  onRestart,
  onExit,
}: GameStatsProps) {
  return (
    <section
      aria-label="Informações da partida"
      className="rounded-2xl border border-line bg-panel/80 p-3 backdrop-blur-md sm:p-4 lg:flex lg:flex-col lg:gap-6 lg:p-6 short:flex short:h-full short:flex-col short:gap-3 short:p-3"
    >
      <div className="flex items-center justify-between gap-3 lg:items-start">
        <p className="min-w-0 truncate text-sm text-muted">
          Jogando como <span className="font-medium text-fg">{player}</span>
        </p>
        <div className="flex shrink-0 gap-1.5 lg:hidden short:hidden">
          <IconButton label="Reiniciar partida" onClick={onRestart}>
            <RotateCcw className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton label="Sair para o início" onClick={onExit}>
            <LogOut className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 sm:gap-6 lg:mt-0 lg:flex-col lg:items-stretch lg:gap-6 short:mt-0 short:flex-col short:items-stretch short:gap-3">
        <div className="lg:flex lg:justify-center short:flex short:justify-center">
          <Timer remainingMs={remainingMs} limitMs={TIME_LIMIT_MS} running={running} />
        </div>
        <dl className="grid flex-1 grid-cols-2 gap-4 lg:gap-6 short:gap-3">
          <Stat label="Pares" value={pairsFound} suffix={`/${PAIR_COUNT}`} />
          <Stat label="Movimentos" value={moves} />
        </dl>
      </div>

      <div className="mt-3 lg:mt-0 short:mt-0">
        <ProgressBar value={pairsFound} max={PAIR_COUNT} label="Pares encontrados" />
      </div>

      <div className="hidden gap-2 lg:mt-auto lg:grid lg:grid-cols-2 short:mt-auto short:grid short:grid-cols-2">
        <TextButton onClick={onRestart}>
          <RotateCcw className="size-4" aria-hidden="true" /> Reiniciar
        </TextButton>
        <TextButton onClick={onExit}>
          <LogOut className="size-4" aria-hidden="true" /> Sair
        </TextButton>
      </div>
    </section>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-lg border border-line bg-raised text-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      {children}
    </button>
  )
}

function TextButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-raised text-sm font-medium text-muted transition-colors hover:border-line-strong hover:text-fg short:h-9"
    >
      {children}
    </button>
  )
}
