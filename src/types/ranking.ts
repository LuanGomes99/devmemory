export interface RankingEntry {
  /** Mesmo id da partida: impede registrar a mesma vitória duas vezes. */
  id: string
  name: string
  score: number
  /** Tempo utilizado, em milissegundos. */
  timeMs: number
  /** Tempo restante, em milissegundos. */
  remainingMs: number
  moves: number
  /** Data e horário da partida (epoch ms). */
  playedAt: number
}
