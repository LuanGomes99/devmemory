import { memo, useCallback, useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { getTech } from '../data/technologies'
import type { GameState } from '../types/game'
import { MemoryCard } from './MemoryCard'

const COLUMNS = 4

interface GameBoardProps {
  state: GameState
  onFlip: (index: number) => void
}

export const GameBoard = memo(function GameBoard({ state, onFlip }: GameBoardProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const { cards, selected, mismatch, status } = state
  const ended = status === 'won' || status === 'lost'
  const locked = ended || mismatch !== null

  // Setas movem o foco pela grade; Enter/Espaço viram o card (comportamento nativo do botão).
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: COLUMNS,
      ArrowUp: -COLUMNS,
    }
    const delta = moves[event.key]
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      buttons.current[event.key === 'Home' ? 0 : buttons.current.length - 1]?.focus()
      return
    }
    if (delta === undefined) return
    event.preventDefault()
    const next = index + delta
    if (next >= 0 && next < buttons.current.length) buttons.current[next]?.focus()
  }, [])

  return (
    <div
      className="board grid grid-cols-4 gap-[clamp(0.4rem,1.6vw,0.85rem)] short:gap-2"
      data-state={status}
      role="group"
      aria-label="Tabuleiro com 16 cards"
    >
      {cards.map((card, index) => {
        const tech = getTech(card.techId)
        const isSelected = selected.includes(index)
        const isMismatch = mismatch !== null && mismatch.includes(index)
        const revealedOnLoss = status === 'lost' && !card.matched
        return (
          <div
            key={card.uid}
            className="board-cell aspect-[4/5] short:aspect-[10/9]"
            style={{ '--i': index } as CSSProperties}
          >
            <MemoryCard
              tech={tech}
              index={index}
              flipped={card.matched || isSelected || revealedOnLoss}
              matched={card.matched}
              mismatch={isMismatch}
              missed={revealedOnLoss}
              locked={locked}
              onSelect={onFlip}
              onKeyDown={handleKeyDown}
              buttonRef={(node) => {
                buttons.current[index] = node
              }}
            />
          </div>
        )
      })}
    </div>
  )
})
