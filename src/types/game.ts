export interface Technology {
  id: string
  name: string
  /** Cor de destaque exibida no card (hex). */
  color: string
  /** Path SVG (viewBox 24x24) do Simple Icons. `null` para ícones desenhados localmente. */
  path: string | null
}

export interface Card {
  /** Identificador único do card dentro da partida. */
  uid: string
  techId: string
  matched: boolean
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

export type GameEvent =
  | { type: 'match'; techId: string; seq: number }
  | { type: 'miss'; seq: number }

export interface GameState {
  status: GameStatus
  gameId: string
  cards: Card[]
  /** Índices dos cards virados que ainda não formaram par (0, 1 ou 2). */
  selected: number[]
  /** Par divergente aguardando para ser desvirado. Enquanto existir, o tabuleiro fica bloqueado. */
  mismatch: [number, number] | null
  moves: number
  pairsFound: number
  /** Timestamp (performance.now) do início da partida. */
  startedAt: number | null
  /** Timestamp (performance.now) do fim da partida. */
  endedAt: number | null
  lastEvent: GameEvent | null
}

export interface GameSummary {
  elapsedMs: number
  remainingMs: number
  moves: number
  pairsFound: number
}
