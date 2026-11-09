import type { Ref } from 'react'
import { motion } from 'motion/react'
import type { RankingEntry } from '../types/ranking'
import { formatNumber } from '../utils/format'
import { ChallengeSpec } from './ChallengeSpec'
import { DemoBoard } from './DemoBoard'
import { PlayerForm } from './PlayerForm'

interface HomeScreenProps {
  defaultName: string
  best: RankingEntry | null
  onStart: (name: string) => void
  onOpenRanking: () => void
  nameInputRef: Ref<HTMLInputElement>
}

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
}

export function HomeScreen({ defaultName, best, onStart, onOpenRanking, nameInputRef }: HomeScreenProps) {
  return (
    <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-4 pt-6 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14 lg:pt-10 xl:gap-20">
      <motion.section
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08 }}
        aria-labelledby="hero-title"
      >
        <motion.h1
          variants={rise}
          id="hero-title"
          className="max-w-[16ch] text-[clamp(2.15rem,6.2vw,4.6rem)] leading-[1.02] font-semibold tracking-[-0.038em] text-balance"
        >
          Seu cérebro é rápido o suficiente para pensar como um dev?
          <span
            className="animate-blink ml-[0.08em] inline-block h-[0.82em] w-[0.09em] translate-y-[0.08em] rounded-[1px] bg-accent"
            aria-hidden="true"
          />
        </motion.h1>
        <motion.p variants={rise} className="mt-5 max-w-[44ch] text-lg text-muted sm:text-xl">
          Encontre todos os pares de tecnologias antes que o tempo acabe. Você tem 60 segundos.
        </motion.p>

        <motion.div variants={rise} className="mt-8">
          <PlayerForm defaultName={defaultName} onStart={onStart} inputRef={nameInputRef} />
        </motion.div>

        <motion.p variants={rise} className="mt-1 text-sm text-muted">
          {best ? (
            <>
              Recorde neste navegador:{' '}
              <span className="font-mono text-fg tabular-nums">{formatNumber(best.score)} pts</span>, de{' '}
              <span className="text-fg">{best.name}</span>.{' '}
            </>
          ) : (
            <>Ninguém marcou pontos neste navegador ainda. </>
          )}
          <button
            type="button"
            onClick={onOpenRanking}
            className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
          >
            Ver ranking
          </button>
        </motion.p>
      </motion.section>

      <motion.section
        aria-label="Como funciona"
        className="relative mx-auto w-full max-w-md lg:max-w-none"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 24 }}
      >
        <div
          className="pointer-events-none absolute -inset-y-10 inset-x-0 -z-10 lg:-inset-x-10 bg-[radial-gradient(closest-side,rgb(93_111_232/0.22),transparent)] blur-2xl"
          aria-hidden="true"
        />
        <DemoBoard />
        <div className="mt-4 lg:mr-10 lg:-ml-8">
          <ChallengeSpec />
        </div>
      </motion.section>
    </main>
  )
}
