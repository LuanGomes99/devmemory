import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Confetti } from './components/Confetti'
import { GameScreen } from './components/GameScreen'
import { Header } from './components/Header'
import { HomeScreen } from './components/HomeScreen'
import { RankingModal } from './components/RankingModal'
import { ResultModal, type GameResult } from './components/ResultModal'
import { getTech } from './data/technologies'
import { useMemoryGame } from './hooks/useMemoryGame'
import { useRanking } from './hooks/useRanking'
import { sanitizeName } from './utils/ranking'
import { calculateScore } from './utils/scoring'
import { readItem, writeItem } from './utils/storage'

const PLAYER_KEY = 'dev-memory-player-v1'
/** Pausa entre o fim da partida e o modal, para a animação do tabuleiro aparecer. */
const RESULT_DELAY_MS = { won: 900, lost: 1100 } as const

export default function App() {
  const game = useMemoryGame()
  const ranking = useRanking()
  const { state, summary, start, reset } = game
  const addResult = ranking.add

  const [player, setPlayer] = useState(() => sanitizeName(readItem(PLAYER_KEY) ?? ''))
  const [rankingOpen, setRankingOpen] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  const [resultOpen, setResultOpen] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const recordedGames = useRef(new Set<string>())
  const nameInputRef = useRef<HTMLInputElement>(null)

  const screen = state.status === 'idle' ? 'home' : 'game'

  // Fim de partida: calcula o resultado e registra vitórias (uma única vez por partida).
  useEffect(() => {
    if ((state.status !== 'won' && state.status !== 'lost') || !summary) return
    if (recordedGames.current.has(state.gameId)) return
    recordedGames.current.add(state.gameId)

    let next: GameResult
    if (state.status === 'won') {
      const score = calculateScore(summary.remainingMs, summary.moves)
      const position = addResult({
        id: state.gameId,
        name: player,
        score: score.total,
        timeMs: Math.round(summary.elapsedMs),
        remainingMs: Math.round(summary.remainingMs),
        moves: summary.moves,
        playedAt: Date.now(),
      })
      setHighlightId(state.gameId)
      next = { outcome: 'won', gameId: state.gameId, player, summary, score, position }
    } else {
      next = { outcome: 'lost', gameId: state.gameId, player, summary, score: null, position: null }
    }
    setResult(next)
  }, [state.status, state.gameId, summary, player, addResult])

  useEffect(() => {
    if (!result || result.gameId !== state.gameId) return
    const timeout = window.setTimeout(() => setResultOpen(true), RESULT_DELAY_MS[result.outcome])
    return () => window.clearTimeout(timeout)
  }, [result, state.gameId])

  const startGame = useCallback(
    (name: string) => {
      setPlayer(name)
      writeItem(PLAYER_KEY, name)
      setResultOpen(false)
      setResult(null)
      start()
      window.scrollTo({ top: 0 })
    },
    [start],
  )

  const playAgain = useCallback(() => {
    setResultOpen(false)
    setResult(null)
    setRankingOpen(false)
    start()
  }, [start, reset])

  const goHome = useCallback(() => {
    setResultOpen(false)
    setResult(null)
    setRankingOpen(false)
    reset()
    window.scrollTo({ top: 0 })
  }, [start, reset])

  const playFromRanking = useCallback(() => {
    setRankingOpen(false)
    if (screen === 'home') {
      window.setTimeout(() => nameInputRef.current?.focus(), 250)
    } else if (state.status !== 'playing') {
      playAgain()
    }
  }, [screen, state.status, playAgain])

  const confettiColors = useMemo(() => {
    const techColors = Array.from(new Set(state.cards.map((c) => getTech(c.techId).color)))
    return [...techColors, '#8c9dff', '#5be3b0', '#f2c14e']
  }, [state.cards])

  const best = ranking.entries[0] ?? null

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-backdrop" aria-hidden="true" />
      <div className="relative flex min-h-dvh flex-col overflow-x-clip">
        <Header
          onOpenRanking={() => setRankingOpen(true)}
          rankingCount={ranking.entries.length}
          compact={screen === 'game'}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {screen === 'home' ? (
              <HomeScreen
                defaultName={player}
                best={best}
                onStart={startGame}
                onOpenRanking={() => setRankingOpen(true)}
                nameInputRef={nameInputRef}
              />
            ) : (
              <GameScreen
                state={state}
                player={player}
                remainingMs={game.remainingMs}
                onFlip={game.flip}
                onRestart={playAgain}
                onExit={goHome}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {screen === 'home' && (
          <footer className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-6 text-xs text-faint sm:px-6">
            O ranking fica salvo apenas neste navegador. Nada é enviado para servidores, e outros
            dispositivos não veem seus resultados.
          </footer>
        )}
      </div>

      <Confetti
        burstKey={resultOpen && result?.outcome === 'won' ? result.gameId : null}
        colors={confettiColors}
      />

      <ResultModal
        result={result}
        open={resultOpen}
        onPlayAgain={playAgain}
        onHome={goHome}
        onOpenRanking={() => setRankingOpen(true)}
      />

      <RankingModal
        open={rankingOpen}
        onClose={() => setRankingOpen(false)}
        entries={ranking.entries}
        persistent={ranking.persistent}
        highlightId={highlightId}
        inGame={state.status === 'playing'}
        onClear={() => {
          ranking.clear()
          setHighlightId(null)
        }}
        onPlay={playFromRanking}
      />
    </MotionConfig>
  )
}
