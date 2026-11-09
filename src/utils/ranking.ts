import type { RankingEntry } from '../types/ranking'
import { readItem, removeItem, writeItem } from './storage'

export const RANKING_KEY = 'dev-memory-ranking-v1'
export const RANKING_LIMIT = 10
export const NAME_MAX_LENGTH = 16

/** Remove espaços nas pontas, colapsa espaços internos e aplica o limite de caracteres. */
export function sanitizeName(raw: string): string {
  return Array.from(raw.replace(/\s+/g, ' ').trim()).slice(0, NAME_MAX_LENGTH).join('').trim()
}

/**
 * Ordenação: maior pontuação, depois menor tempo, depois menos movimentos.
 * Empate completo: quem registrou primeiro fica na frente (playedAt crescente;
 * Array.prototype.sort é estável, então a ordem de inserção também é preservada).
 */
export function compareEntries(a: RankingEntry, b: RankingEntry): number {
  return (
    b.score - a.score ||
    a.timeMs - b.timeMs ||
    a.moves - b.moves ||
    a.playedAt - b.playedAt
  )
}

export function sortRanking(entries: readonly RankingEntry[]): RankingEntry[] {
  return entries.slice().sort(compareEntries)
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/** Valida um item vindo do armazenamento. Itens adulterados ou incompletos são descartados. */
function parseEntry(value: unknown): RankingEntry | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  if (typeof v.id !== 'string' || v.id.length === 0 || v.id.length > 64) return null
  if (typeof v.name !== 'string') return null
  const name = sanitizeName(v.name)
  if (!name) return null
  if (
    !isFiniteNumber(v.score) ||
    !isFiniteNumber(v.timeMs) ||
    !isFiniteNumber(v.remainingMs) ||
    !isFiniteNumber(v.moves) ||
    !isFiniteNumber(v.playedAt)
  ) {
    return null
  }
  if (v.score < 0 || v.score > 10_000) return null
  if (v.timeMs < 0 || v.timeMs > 60_000 || v.remainingMs < 0 || v.remainingMs > 60_000) return null
  if (v.moves < 8 || v.moves > 10_000) return null
  return {
    id: v.id,
    name,
    score: Math.round(v.score),
    timeMs: Math.round(v.timeMs),
    remainingMs: Math.round(v.remainingMs),
    moves: Math.round(v.moves),
    playedAt: v.playedAt,
  }
}

export function loadRanking(): RankingEntry[] {
  const raw = readItem(RANKING_KEY)
  if (!raw) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    // JSON corrompido: descarta para não quebrar a aplicação.
    removeItem(RANKING_KEY)
    return []
  }
  if (!Array.isArray(parsed)) {
    removeItem(RANKING_KEY)
    return []
  }
  const seen = new Set<string>()
  const valid: RankingEntry[] = []
  for (const item of parsed) {
    const entry = parseEntry(item)
    if (entry && !seen.has(entry.id)) {
      seen.add(entry.id)
      valid.push(entry)
    }
  }
  const sorted = sortRanking(valid).slice(0, RANKING_LIMIT)
  // Se algo foi descartado, regrava a versão limpa.
  if (sorted.length !== parsed.length) saveRanking(sorted)
  return sorted
}

export function saveRanking(entries: readonly RankingEntry[]): boolean {
  return writeItem(RANKING_KEY, JSON.stringify(entries))
}

export function clearRanking(): void {
  removeItem(RANKING_KEY)
}
