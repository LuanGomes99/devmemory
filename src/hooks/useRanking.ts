import { useCallback, useEffect, useRef, useState } from 'react'
import type { RankingEntry } from '../types/ranking'
import {
  RANKING_KEY,
  RANKING_LIMIT,
  clearRanking,
  loadRanking,
  saveRanking,
  sortRanking,
} from '../utils/ranking'
import { isStorageAvailable } from '../utils/storage'

export function useRanking() {
  const [entries, setEntries] = useState<RankingEntry[]>(() => loadRanking())
  const [persistent] = useState(() => isStorageAvailable())
  const entriesRef = useRef(entries)
  entriesRef.current = entries

  // Mantém abas abertas ao mesmo tempo sincronizadas.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === RANKING_KEY || event.key === null) setEntries(loadRanking())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /** Registra uma vitória. Retorna a posição (1–10) ou `null` se ficou fora do top 10. */
  const add = useCallback((entry: RankingEntry): number | null => {
    // Relê do armazenamento para não sobrescrever resultados de outra aba.
    const current = persistent ? loadRanking() : entriesRef.current
    const existing = current.findIndex((e) => e.id === entry.id)
    if (existing !== -1) return existing + 1

    const next = sortRanking([...current, entry]).slice(0, RANKING_LIMIT)
    saveRanking(next)
    entriesRef.current = next
    setEntries(next)
    const position = next.findIndex((e) => e.id === entry.id)
    return position === -1 ? null : position + 1
  }, [persistent])

  const clear = useCallback(() => {
    clearRanking()
    entriesRef.current = []
    setEntries([])
  }, [])

  return { entries, persistent, add, clear }
}
