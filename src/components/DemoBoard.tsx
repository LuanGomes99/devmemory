import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { getTech } from '../data/technologies'
import { MemoryCard } from './MemoryCard'

/** Seis cards fixos que demonstram a mecânica em loop na tela inicial. */
const LAYOUT = ['react', 'typescript', 'python', 'typescript', 'python', 'react'] as const

interface Frame {
  flipped: number[]
  matched: number[]
  mismatch?: boolean
  status: string
  tone: 'idle' | 'miss' | 'match' | 'done'
}

const FRAMES: Frame[] = [
  { flipped: [], matched: [], status: 'aguardando jogada', tone: 'idle' },
  { flipped: [0], matched: [], status: 'card 1 revelado', tone: 'idle' },
  { flipped: [0, 1], matched: [], mismatch: true, status: 'React ≠ TypeScript', tone: 'miss' },
  { flipped: [], matched: [], status: 'desvirando…', tone: 'idle' },
  { flipped: [1], matched: [], status: 'card 2 revelado', tone: 'idle' },
  { flipped: [], matched: [1, 3], status: 'par: TypeScript', tone: 'match' },
  { flipped: [2], matched: [1, 3], status: 'card 3 revelado', tone: 'idle' },
  { flipped: [], matched: [1, 2, 3, 4], status: 'par: Python', tone: 'match' },
  { flipped: [0], matched: [1, 2, 3, 4], status: 'card 1 revelado', tone: 'idle' },
  { flipped: [], matched: [0, 1, 2, 3, 4, 5], status: 'todos os pares!', tone: 'done' },
  { flipped: [], matched: [0, 1, 2, 3, 4, 5], status: 'todos os pares!', tone: 'done' },
]

const STATIC_FRAME: Frame = {
  flipped: [2],
  matched: [1, 3],
  status: 'par: TypeScript',
  tone: 'match',
}

const toneClass: Record<Frame['tone'], string> = {
  idle: 'text-muted',
  miss: 'text-danger',
  match: 'text-ok',
  done: 'text-ok',
}

export function DemoBoard() {
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      if (!document.hidden) setStep((s) => (s + 1) % FRAMES.length)
    }, 1050)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  const frame = reduceMotion ? STATIC_FRAME : FRAMES[step]
  const pairs = frame.matched.length / 2

  return (
    <div className="relative">
      {/* Janela no estilo de editor */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-2/85 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-line bg-panel/80 pr-3">
          <div className="flex">
            <span className="flex items-center gap-2 border-r border-line border-b-2 border-b-accent bg-ink-2 px-4 py-2.5 font-mono text-xs text-fg">
              <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
              tabuleiro.tsx
            </span>
            <span className="hidden items-center px-4 py-2.5 font-mono text-xs text-faint sm:flex">
              ranking.json
            </span>
          </div>
          <span className="font-mono text-[0.7rem] text-faint">demo</span>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 sm:gap-4 sm:p-6" aria-hidden="true">
          {LAYOUT.map((id, i) => (
            <motion.div
              key={i}
              className="aspect-[4/5]"
              initial={{ opacity: 0, y: 18, rotate: (i % 3) - 1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.35 + i * 0.07, type: 'spring', stiffness: 220, damping: 20 }}
            >
              <MemoryCard
                tech={getTech(id)}
                index={i}
                interactive={false}
                flipped={frame.flipped.includes(i) || frame.matched.includes(i)}
                matched={frame.matched.includes(i)}
                mismatch={Boolean(frame.mismatch) && frame.flipped.includes(i)}
              />
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-panel/80 px-4 py-2 font-mono text-[0.7rem] sm:text-xs">
          <span className={`truncate transition-colors ${toneClass[frame.tone]}`} aria-live="off">
            {frame.status}
          </span>
          <span className="shrink-0 text-faint tabular-nums">pares {pairs}/3</span>
        </div>
      </div>
    </div>
  )
}
