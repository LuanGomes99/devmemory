import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { getTech } from '../data/technologies'
import { PAIR_COUNT } from '../hooks/useMemoryGame'
import type { GameState } from '../types/game'
import { GameBoard } from './GameBoard'
import { GameStats } from './GameStats'

interface GameScreenProps {
  state: GameState
  player: string
  remainingMs: number
  onFlip: (index: number) => void
  onRestart: () => void
  onExit: () => void
}

export function GameScreen({ state, player, remainingMs, onFlip, onRestart, onExit }: GameScreenProps) {
  const announcement = useAnnouncement(state)

  return (
    <motion.main
      className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 content-start gap-3 px-3 pb-4 sm:gap-5 sm:px-6 sm:pb-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:content-center lg:gap-10 lg:pb-10 short:grid-cols-[13.5rem_minmax(0,1fr)] short:content-center short:gap-4 short:pb-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <h1 className="sr-only">Partida em andamento</h1>
      <div className="sticky top-2 z-20 lg:static short:static">
        <GameStats
          player={player}
          remainingMs={remainingMs}
          running={state.status === 'playing'}
          pairsFound={state.pairsFound}
          moves={state.moves}
          onRestart={onRestart}
          onExit={onExit}
        />
      </div>

      <div className="board-fit w-full">
        <GameBoard key={state.gameId} state={state} onFlip={onFlip} />
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </motion.main>
  )
}

/** Mensagens para leitores de tela a cada jogada. */
function useAnnouncement(state: GameState) {
  const [message, setMessage] = useState('')
  const { lastEvent, pairsFound, status } = state

  useEffect(() => {
    if (!lastEvent) return
    if (lastEvent.type === 'match') {
      setMessage(`Par encontrado: ${getTech(lastEvent.techId).name}. ${pairsFound} de ${PAIR_COUNT}.`)
    } else {
      setMessage('Não combinou.')
    }
  }, [lastEvent, pairsFound])

  useEffect(() => {
    if (status === 'won') setMessage('Todos os pares encontrados!')
    if (status === 'lost') setMessage('Tempo esgotado.')
  }, [status])

  return message
}
