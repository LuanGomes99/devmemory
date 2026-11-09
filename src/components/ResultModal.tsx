import { motion } from 'motion/react'
import { Home, RotateCcw, TimerOff, Trophy } from 'lucide-react'
import { PAIR_COUNT, TIME_LIMIT_MS } from '../hooks/useMemoryGame'
import type { GameSummary } from '../types/game'
import type { ScoreBreakdown } from '../utils/scoring'
import { formatNumber, formatSeconds } from '../utils/format'
import { AnimatedNumber } from './AnimatedNumber'
import { Modal } from './Modal'

export interface GameResult {
  outcome: 'won' | 'lost'
  gameId: string
  player: string
  summary: GameSummary
  score: ScoreBreakdown | null
  position: number | null
}

interface ResultModalProps {
  result: GameResult | null
  open: boolean
  onPlayAgain: () => void
  onHome: () => void
  onOpenRanking: () => void
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function ResultModal({ result, open, onPlayAgain, onHome, onOpenRanking }: ResultModalProps) {
  return (
    <Modal
      open={open && result !== null}
      onClose={onHome}
      dismissible={false}
      labelledBy="result-title"
      describedBy="result-desc"
      className="sm:max-w-lg"
    >
      {result && (result.outcome === 'won' ? <Victory result={result} /> : <Defeat result={result} />)}
      {result && (
        <div className="grid grid-cols-2 gap-2 px-5 pb-6 sm:px-7 sm:pb-7">
          <button
            type="button"
            data-autofocus
            onClick={onPlayAgain}
            className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-[0.95rem] font-semibold text-ink shadow-[0_8px_30px_-10px_var(--color-accent)] transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {result.outcome === 'won' ? 'Jogar novamente' : 'Tentar novamente'}
          </button>
          <button
            type="button"
            onClick={onOpenRanking}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-raised px-4 text-sm font-medium transition-colors hover:bg-line"
          >
            <Trophy className="size-4 text-gold" aria-hidden="true" />
            Ver ranking
          </button>
          <button
            type="button"
            onClick={onHome}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            <Home className="size-4" aria-hidden="true" />
            Voltar ao início
          </button>
        </div>
      )}
    </Modal>
  )
}

function Victory({ result }: { result: GameResult }) {
  const { summary, score, position, player } = result
  const seconds = Math.max(1, Math.round(summary.elapsedMs / 1000))
  // Arredonda o tempo usado em décimos e deriva o restante dele, para os dois sempre somarem 60 s.
  const elapsedTenthsMs = Math.round(summary.elapsedMs / 100) * 100
  return (
    <motion.div
      className="relative overflow-hidden px-5 pt-7 pb-5 sm:px-7 sm:pt-8"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[120%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(91_227_176/0.2),transparent)]"
        aria-hidden="true"
      />
      <motion.div variants={item} className="relative flex items-center gap-2 text-sm font-medium text-ok">
        <span className="grid size-6 place-items-center rounded-full bg-ok/15">
          <Trophy className="size-3.5" aria-hidden="true" />
        </span>
        {position ? `${position}º lugar no ranking` : 'Fora do top 10 desta vez'}
      </motion.div>
      <motion.h2 variants={item} id="result-title" className="relative mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Desafio concluído!
      </motion.h2>
      <motion.p variants={item} id="result-desc" className="relative mt-2 text-muted">
        Mandou bem, <span className="text-fg">{player}</span>! Você encontrou todos os pares em{' '}
        {seconds} {seconds === 1 ? 'segundo' : 'segundos'}.
      </motion.p>

      {score && (
        <motion.div variants={item} className="relative mt-6 rounded-2xl border border-line bg-raised p-4 sm:p-5">
          <p className="text-sm text-muted">Pontuação final</p>
          <p className="mt-1 font-mono text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
            <AnimatedNumber value={score.total} />
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 font-mono text-xs text-muted">
            <Breakdown label="Base" value={score.base} />
            <Breakdown label="Tempo" value={score.timeBonus} />
            <Breakdown label="Eficiência" value={score.efficiencyBonus} />
          </dl>
        </motion.div>
      )}

      <motion.dl variants={item} className="relative mt-3 grid grid-cols-3 gap-2">
        <Metric label="Tempo usado" value={formatSeconds(elapsedTenthsMs)} />
        <Metric label="Restante" value={formatSeconds(TIME_LIMIT_MS - elapsedTenthsMs)} />
        <Metric label="Movimentos" value={String(summary.moves)} />
      </motion.dl>
    </motion.div>
  )
}

function Defeat({ result }: { result: GameResult }) {
  const { summary } = result
  const found = summary.pairsFound
  const message =
    found === 0
      ? 'Nenhum par dessa vez. Comece pelos cantos e memorize cada card que aparecer.'
      : found === PAIR_COUNT - 1
        ? `Faltou um! Você encontrou ${found} dos ${PAIR_COUNT} pares. Que tal tentar novamente?`
        : `Quase lá! Você encontrou ${found} dos ${PAIR_COUNT} pares. Que tal tentar novamente?`

  return (
    <motion.div
      className="relative px-5 pt-7 pb-5 sm:px-7 sm:pt-8"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}
    >
      <motion.div variants={item} className="flex items-center gap-2 text-sm font-medium text-danger">
        <span className="grid size-6 place-items-center rounded-full bg-danger/15">
          <TimerOff className="size-3.5" aria-hidden="true" />
        </span>
        60 segundos esgotados
      </motion.div>
      <motion.h2 variants={item} id="result-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Tempo esgotado!
      </motion.h2>
      <motion.p variants={item} id="result-desc" className="mt-2 text-muted">
        {message}
      </motion.p>

      <motion.div variants={item} className="mt-6 rounded-2xl border border-line bg-raised p-4 sm:p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Pares encontrados</p>
            <p className="mt-1 font-mono text-5xl font-semibold tabular-nums">
              {found}
              <span className="text-2xl text-faint">/{PAIR_COUNT}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">Movimentos</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{summary.moves}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-1" aria-hidden="true">
          {Array.from({ length: PAIR_COUNT }, (_, i) => (
            <motion.span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < found ? 'bg-accent' : 'bg-line'}`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            />
          ))}
        </div>
      </motion.div>
      <motion.p variants={item} className="mt-3 text-xs text-faint">
        Partidas não concluídas não entram no ranking.
      </motion.p>
    </motion.div>
  )
}

function Breakdown({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="mt-0.5 text-sm text-fg tabular-nums">+{formatNumber(value)}</dd>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line px-3 py-2.5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-[0.95rem] font-semibold tabular-nums sm:text-base">{value}</dd>
    </div>
  )
}
