import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { TECHNOLOGIES } from '../data/technologies'
import type { Card, GameState, GameSummary } from '../types/game'
import { createId, shuffle } from '../utils/shuffle'
import { useCountdown } from './useCountdown'

export const TIME_LIMIT_MS = 60_000
export const PAIR_COUNT = 8
/** Tempo que um par errado fica visível antes de desvirar. */
export const MISMATCH_DELAY_MS = 900

type Action =
  | { type: 'start'; cards: Card[]; gameId: string; now: number }
  | { type: 'flip'; index: number; now: number }
  | { type: 'resolve' }
  | { type: 'timeout' }
  | { type: 'reset' }

function initialState(): GameState {
  return {
    status: 'idle',
    gameId: '',
    cards: [],
    selected: [],
    mismatch: null,
    moves: 0,
    pairsFound: 0,
    startedAt: null,
    endedAt: null,
    lastEvent: null,
  }
}

function expire(state: GameState): GameState {
  if (state.status !== 'playing' || state.startedAt === null) return state
  return {
    ...state,
    status: 'lost',
    endedAt: state.startedAt + TIME_LIMIT_MS,
    selected: [],
    mismatch: null,
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'start':
      return {
        ...initialState(),
        status: 'playing',
        gameId: action.gameId,
        cards: action.cards,
        startedAt: action.now,
      }

    case 'reset':
      return initialState()

    case 'timeout':
      return expire(state)

    case 'resolve':
      if (!state.mismatch) return state
      return { ...state, selected: [], mismatch: null }

    case 'flip': {
      if (state.status !== 'playing' || state.startedAt === null) return state
      // O clique chegou depois do limite (ex.: aba voltou do segundo plano): vale o tempo.
      if (action.now - state.startedAt >= TIME_LIMIT_MS) return expire(state)
      // Comparação em andamento: ignora cliques.
      if (state.mismatch) return state

      const card = state.cards[action.index]
      if (!card || card.matched || state.selected.includes(action.index)) return state

      const seq = state.moves + 1

      if (state.selected.length === 0) {
        return { ...state, selected: [action.index] }
      }

      const first = state.selected[0]
      const moves = state.moves + 1

      if (state.cards[first].techId === card.techId) {
        const cards = state.cards.map((c, i) =>
          i === first || i === action.index ? { ...c, matched: true } : c,
        )
        const pairsFound = state.pairsFound + 1
        const won = pairsFound === PAIR_COUNT
        return {
          ...state,
          cards,
          selected: [],
          moves,
          pairsFound,
          status: won ? 'won' : 'playing',
          endedAt: won ? action.now : null,
          lastEvent: { type: 'match', techId: card.techId, seq },
        }
      }

      return {
        ...state,
        selected: [first, action.index],
        mismatch: [first, action.index],
        moves,
        lastEvent: { type: 'miss', seq },
      }
    }
  }
}

/** Sorteia 8 tecnologias, duplica e embaralha. Evita repetir a mesma disposição da partida anterior. */
function createDeck(previousSignature: string | null): { cards: Card[]; signature: string } {
  for (let attempt = 0; attempt < 6; attempt++) {
    const picked = shuffle(TECHNOLOGIES).slice(0, PAIR_COUNT)
    const pairs = picked.flatMap((tech) => [
      { uid: `${tech.id}-a`, techId: tech.id, matched: false },
      { uid: `${tech.id}-b`, techId: tech.id, matched: false },
    ])
    const cards = shuffle(pairs)
    const signature = cards.map((c) => c.techId).join('|')
    if (signature !== previousSignature) return { cards, signature }
  }
  const cards = shuffle(
    TECHNOLOGIES.slice(0, PAIR_COUNT).flatMap((tech) => [
      { uid: `${tech.id}-a`, techId: tech.id, matched: false },
      { uid: `${tech.id}-b`, techId: tech.id, matched: false },
    ]),
  )
  return { cards, signature: cards.map((c) => c.techId).join('|') }
}

export function useMemoryGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const lastSignature = useRef<string | null>(null)

  const start = useCallback(() => {
    const { cards, signature } = createDeck(lastSignature.current)
    lastSignature.current = signature
    dispatch({ type: 'start', cards, gameId: createId(), now: performance.now() })
  }, [])

  const reset = useCallback(() => dispatch({ type: 'reset' }), [])

  const flip = useCallback((index: number) => {
    dispatch({ type: 'flip', index, now: performance.now() })
  }, [])

  // Desvira o par errado depois do intervalo.
  useEffect(() => {
    if (!state.mismatch) return
    const timeout = window.setTimeout(() => dispatch({ type: 'resolve' }), MISMATCH_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [state.mismatch])

  const onExpire = useCallback(() => dispatch({ type: 'timeout' }), [])
  const remainingMs = useCountdown(state.startedAt, state.endedAt, TIME_LIMIT_MS, onExpire)

  const summary = useMemo<GameSummary | null>(() => {
    if (state.startedAt === null || state.endedAt === null) return null
    const elapsedMs = Math.min(TIME_LIMIT_MS, state.endedAt - state.startedAt)
    return {
      elapsedMs,
      remainingMs: TIME_LIMIT_MS - elapsedMs,
      moves: state.moves,
      pairsFound: state.pairsFound,
    }
  }, [state.startedAt, state.endedAt, state.moves, state.pairsFound])

  return { state, remainingMs, summary, start, reset, flip }
}
