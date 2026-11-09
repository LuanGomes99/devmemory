import { useEffect, useRef, useState, type CSSProperties, type Ref } from 'react'
import { motion } from 'motion/react'
import { HardDrive, Trash2, Trophy, X } from 'lucide-react'
import type { RankingEntry } from '../types/ranking'
import { formatDate, formatNumber, formatSeconds } from '../utils/format'
import { Modal } from './Modal'

interface RankingModalProps {
  open: boolean
  onClose: () => void
  entries: RankingEntry[]
  persistent: boolean
  highlightId: string | null
  inGame: boolean
  onClear: () => void
  onPlay: () => void
}

const MEDALS = [
  { label: 'Ouro', color: 'var(--color-gold)' },
  { label: 'Prata', color: 'var(--color-silver)' },
  { label: 'Bronze', color: 'var(--color-bronze)' },
] as const

export function RankingModal({
  open,
  onClose,
  entries,
  persistent,
  highlightId,
  inGame,
  onClear,
  onPlay,
}: RankingModalProps) {
  const [confirming, setConfirming] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const clearRef = useRef<HTMLButtonElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)
  /** Para onde o foco vai depois de confirmar/cancelar a limpeza. */
  const focusAfter = useRef<'cancel' | 'clear' | 'play' | null>(null)

  useEffect(() => {
    if (!open) setConfirming(false)
  }, [open])

  useEffect(() => {
    const target = focusAfter.current
    focusAfter.current = null
    if (target === 'cancel') cancelRef.current?.focus()
    if (target === 'clear') clearRef.current?.focus()
    if (target === 'play') playRef.current?.focus()
  }, [confirming, entries.length])

  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <Modal open={open} onClose={onClose} labelledBy="ranking-title" className="sm:max-w-xl">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-panel/95 px-5 pt-5 pb-4 backdrop-blur sm:px-7 sm:pt-6">
        <div>
          <h2 id="ranking-title" className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
            <Trophy className="size-5 text-gold" aria-hidden="true" />
            Hall of Fame
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <HardDrive className="size-3.5 shrink-0" aria-hidden="true" />
            {persistent
              ? 'Os 10 melhores resultados deste navegador.'
              : 'Armazenamento indisponível: o ranking vale só até fechar a aba.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar ranking"
          className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-fg"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="px-5 pt-4 pb-6 sm:px-7 sm:pb-7">
        {inGame && (
          <p className="mb-4 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
            O cronômetro continua rodando enquanto você vê o ranking.
          </p>
        )}

        {entries.length === 0 ? (
          <EmptyState onPlay={onPlay} buttonRef={playRef} />
        ) : (
          <>
            <ol className="space-y-2" aria-label="Três primeiros colocados">
              {podium.map((entry, i) => (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.05, type: 'spring', stiffness: 300, damping: 26 }}
                  className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-raised px-3 py-3 sm:gap-4 sm:px-4"
                  style={{ '--medal': MEDALS[i].color } as CSSProperties}
                  data-highlight={entry.id === highlightId}
                >
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[color-mix(in_oklab,var(--medal)_14%,transparent)] to-transparent"
                    aria-hidden="true"
                  />
                  <MedalBadge position={i + 1} label={MEDALS[i].label} />
                  <EntryBody entry={entry} highlighted={entry.id === highlightId} large />
                </motion.li>
              ))}
            </ol>

            {rest.length > 0 && (
              <ol start={4} className="mt-4 divide-y divide-line border-t border-line" aria-label="Demais colocados">
                {rest.map((entry, i) => (
                  <motion.li
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + 0.04 * i, duration: 0.25 }}
                    className="flex items-center gap-3 px-1 py-3 sm:gap-4 sm:px-2"
                  >
                    <span className="w-9 shrink-0 text-center font-mono text-sm text-faint tabular-nums">
                      {i + 4}º
                    </span>
                    <EntryBody entry={entry} highlighted={entry.id === highlightId} />
                  </motion.li>
                ))}
              </ol>
            )}

            <div className="mt-6 border-t border-line pt-4">
              {confirming ? (
                <div
                  role="alertdialog"
                  aria-labelledby="clear-title"
                  aria-describedby="clear-desc"
                  className="rounded-xl border border-danger/35 bg-danger/8 p-4"
                >
                  <p id="clear-title" className="font-medium text-fg">
                    Apagar o ranking?
                  </p>
                  <p id="clear-desc" className="mt-1 text-sm text-muted">
                    {entries.length === 1
                      ? 'O resultado salvo neste navegador será apagado.'
                      : `Os ${entries.length} resultados salvos neste navegador serão apagados.`}{' '}
                    Não dá para desfazer.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      ref={cancelRef}
                      type="button"
                      onClick={() => {
                        focusAfter.current = 'clear'
                        setConfirming(false)
                      }}
                      className="h-10 rounded-lg border border-line-strong bg-raised px-4 text-sm font-medium transition-colors hover:bg-line"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        focusAfter.current = 'play'
                        onClear()
                        setConfirming(false)
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-danger px-4 text-sm font-semibold text-ink transition-[filter] hover:brightness-110"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Apagar ranking
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  ref={clearRef}
                  type="button"
                  onClick={() => {
                    focusAfter.current = 'cancel'
                    setConfirming(true)
                  }}
                  className="inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted transition-colors hover:bg-raised hover:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Limpar ranking
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

function MedalBadge({ position, label }: { position: number; label: string }) {
  return (
    <span
      className="relative grid size-10 shrink-0 place-items-center rounded-full border-2 font-mono text-sm font-bold text-ink sm:size-11"
      style={{
        background: 'linear-gradient(145deg, color-mix(in oklab, var(--medal) 100%, white 25%), var(--medal))',
        borderColor: 'color-mix(in oklab, var(--medal) 60%, black)',
        boxShadow: '0 0 22px -6px var(--medal)',
      }}
      title={`Medalha de ${label.toLowerCase()}`}
    >
      <span className="sr-only">{position}º lugar, medalha de {label.toLowerCase()}</span>
      <span aria-hidden="true">{position}</span>
    </span>
  )
}

function EntryBody({
  entry,
  highlighted,
  large = false,
}: {
  entry: RankingEntry
  highlighted: boolean
  large?: boolean
}) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className={`flex items-center gap-2 truncate font-medium ${large ? 'text-base sm:text-lg' : 'text-[0.95rem]'}`}>
          <span className="truncate">{entry.name}</span>
          {highlighted && (
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[0.7rem] font-medium text-accent">
              você
            </span>
          )}
        </p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
          <span>{formatSeconds(entry.timeMs)}</span>
          <span>
            {entry.moves} movimentos
          </span>
          <span className="hidden sm:inline">{formatDate(entry.playedAt)}</span>
        </p>
      </div>
      <p className="shrink-0 text-right">
        <span className={`font-mono font-semibold tabular-nums ${large ? 'text-lg sm:text-xl' : 'text-base'}`}>
          {formatNumber(entry.score)}
        </span>
        <span className="ml-1 text-xs text-muted">pts</span>
      </p>
    </div>
  )
}

function EmptyState({
  onPlay,
  buttonRef,
}: {
  onPlay: () => void
  buttonRef: Ref<HTMLButtonElement>
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="relative mb-6 h-24 w-36" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute top-2 left-1/2 h-20 w-14 rounded-xl border border-dashed border-line-strong bg-raised/60"
            initial={{ rotate: 0, x: '-50%' }}
            animate={{ rotate: (i - 1) * 12, x: `calc(-50% + ${(i - 1) * 34}px)` }}
            transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 200, damping: 18 }}
          />
        ))}
        <Trophy className="absolute top-9 left-1/2 size-6 -translate-x-1/2 text-faint" />
      </div>
      <p className="text-lg font-medium">Nosso ranking está vazio. Que tal ser o primeiro?</p>
      <p className="mt-1 max-w-[34ch] text-sm text-muted">
        Só entram aqui as partidas concluídas dentro dos 60 segundos.
      </p>
      <button
        ref={buttonRef}
        type="button"
        onClick={onPlay}
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-ink transition-[filter] hover:brightness-110"
      >
        Jogar agora
      </button>
    </div>
  )
}
