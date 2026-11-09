import { Trophy } from 'lucide-react'
import { LogoMark } from './Logo'

interface HeaderProps {
  onOpenRanking: () => void
  rankingCount: number
  compact?: boolean
}

export function Header({ onOpenRanking, rankingCount, compact = false }: HeaderProps) {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 short:py-2">
      <div className="flex min-w-0 items-center gap-3">
        <LogoMark className="size-8 shrink-0 sm:size-9" />
        <div className="min-w-0 leading-tight">
          <p className="text-[1.05rem] font-semibold tracking-tight sm:text-lg">
            Dev Memory
          </p>
          <p
            className={`hidden truncate text-xs text-muted sm:block ${compact ? 'short:hidden' : ''}`}
          >
            A Programming Memory Challenge
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenRanking}
        className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-panel/70 pr-4 pl-3 text-sm font-medium text-fg backdrop-blur transition-colors hover:border-line-strong hover:bg-raised"
        aria-label={`Ver ranking (${rankingCount} ${rankingCount === 1 ? 'resultado' : 'resultados'})`}
      >
        <Trophy className="size-4 text-gold transition-transform group-hover:-rotate-12" aria-hidden="true" />
        <span>Ranking</span>
        {rankingCount > 0 && (
          <span className="rounded-full bg-line px-1.5 py-0.5 font-mono text-[0.7rem] leading-none text-muted tabular-nums">
            {rankingCount}
          </span>
        )}
      </button>
    </header>
  )
}
