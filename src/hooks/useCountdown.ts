import { useEffect, useRef, useState } from 'react'

/**
 * Contagem regressiva baseada em timestamps reais (performance.now, monotônico).
 *
 * O intervalo serve apenas para re-renderizar: o tempo restante é sempre
 * `limite − (agora − início)`, então não acumula erro mesmo quando a aba perde
 * o foco e o navegador reduz a frequência dos timers. Um setTimeout dedicado
 * dispara o fim no instante exato, e `visibilitychange` recalcula ao voltar.
 */
export function useCountdown(
  startedAt: number | null,
  endedAt: number | null,
  limitMs: number,
  onExpire: (now: number) => void,
): number {
  const [now, setNow] = useState(() => performance.now())
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const running = startedAt !== null && endedAt === null

  useEffect(() => {
    if (!running || startedAt === null) return

    const tick = () => {
      const current = performance.now()
      setNow(current)
      if (current - startedAt >= limitMs) onExpireRef.current(current)
    }

    tick()
    const interval = window.setInterval(tick, 100)
    const expiry = window.setTimeout(tick, Math.max(0, limitMs - (performance.now() - startedAt)) + 5)
    const onVisibility = () => tick()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onVisibility)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(expiry)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onVisibility)
    }
  }, [running, startedAt, limitMs])

  if (startedAt === null) return limitMs
  const reference = endedAt ?? now
  return Math.min(limitMs, Math.max(0, limitMs - (reference - startedAt)))
}
