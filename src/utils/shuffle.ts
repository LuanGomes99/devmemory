/** Inteiro uniforme em [0, max). Usa crypto quando disponível (sem viés de módulo). */
export function randomInt(max: number): number {
  if (max <= 0) return 0
  const cryptoObj = globalThis.crypto
  if (cryptoObj?.getRandomValues) {
    const buffer = new Uint32Array(1)
    const limit = Math.floor(0x1_0000_0000 / max) * max
    let value: number
    do {
      cryptoObj.getRandomValues(buffer)
      value = buffer[0]
    } while (value >= limit)
    return value % max
  }
  return Math.floor(Math.random() * max)
}

/** Fisher–Yates: devolve uma cópia embaralhada, sem alterar o array original. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function createId(): string {
  const cryptoObj = globalThis.crypto
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID()
  return `${Date.now().toString(36)}-${randomInt(0x7fffffff).toString(36)}`
}
