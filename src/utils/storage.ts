/**
 * Acesso seguro ao localStorage.
 * Em modo privado, com cookies bloqueados ou cota cheia, o acesso pode lançar erro.
 * Nesses casos guardamos os dados em memória: o jogo continua funcionando, só não
 * persiste após recarregar.
 */

const memory = new Map<string, string>()
let available: boolean | null = null

export function isStorageAvailable(): boolean {
  if (available !== null) return available
  try {
    const probe = '__dev-memory-probe__'
    window.localStorage.setItem(probe, probe)
    window.localStorage.removeItem(probe)
    available = true
  } catch {
    available = false
  }
  return available
}

export function readItem(key: string): string | null {
  if (isStorageAvailable()) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      /* cai para a memória */
    }
  }
  return memory.get(key) ?? null
}

export function writeItem(key: string, value: string): boolean {
  memory.set(key, value)
  if (!isStorageAvailable()) return false
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeItem(key: string): void {
  memory.delete(key)
  if (!isStorageAvailable()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignora */
  }
}
