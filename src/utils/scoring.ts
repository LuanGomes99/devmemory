/**
 * Sistema de pontuação do Dev Memory
 * ----------------------------------
 *
 *   pontuação = BASE + bônus de tempo + bônus de eficiência
 *
 *   BASE               = 1000 pontos por concluir os 8 pares.
 *   bônus de tempo     = tempo restante (em segundos, com frações) × 50.
 *                        Máximo teórico: 60 s × 50 = 3000.
 *   bônus de eficiência = max(0, 600 − (movimentos − 8) × 30).
 *                        8 movimentos (nenhum erro) rendem 600; cada movimento extra
 *                        tira 30 pontos; a partir de 28 movimentos o bônus é 0.
 *
 * Por que assim:
 * - O tempo pesa mais (até 3000) porque é o desafio central do jogo.
 * - A eficiência tem teto baixo e nunca fica negativa: errar não "pune" além de
 *   zerar o bônus, então não há incentivo para jogar devagar e evitar cliques.
 * - Como clicar rápido ao acaso gera mais movimentos e mais erros, as duas
 *   métricas se equilibram.
 *
 * Máximo teórico: 1000 + 3000 + 600 = 4600.
 */

export const SCORE_BASE = 1000
export const POINTS_PER_SECOND = 50
export const EFFICIENCY_MAX = 600
export const EFFICIENCY_PENALTY = 30
export const PERFECT_MOVES = 8

export interface ScoreBreakdown {
  base: number
  timeBonus: number
  efficiencyBonus: number
  total: number
}

export function calculateScore(remainingMs: number, moves: number): ScoreBreakdown {
  const safeRemaining = Math.max(0, remainingMs)
  const extraMoves = Math.max(0, moves - PERFECT_MOVES)
  const timeBonus = Math.round((safeRemaining / 1000) * POINTS_PER_SECOND)
  const efficiencyBonus = Math.max(0, EFFICIENCY_MAX - extraMoves * EFFICIENCY_PENALTY)
  return {
    base: SCORE_BASE,
    timeBonus,
    efficiencyBonus,
    total: SCORE_BASE + timeBonus + efficiencyBonus,
  }
}
