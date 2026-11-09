import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

interface ConfettiProps {
  /** Muda o valor para disparar uma nova explosão. `null` não dispara. */
  burstKey: string | null
  colors: string[]
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  spin: number
  color: string
  shape: 0 | 1 | 2
  life: number
  maxLife: number
}

/** Explosão de partículas em canvas, sem dependências. Desativada com movimento reduzido. */
export function Confetti({ burstKey, colors }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!burstKey || reduceMotion || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const w = window.innerWidth
    const h = window.innerHeight
    const count = Math.round(Math.min(220, Math.max(110, w / 7)))
    const palette = colors.length ? colors : ['#8c9dff', '#5be3b0', '#f2c14e']
    const origins = [
      { x: w * 0.5, y: h * 0.42 },
      { x: w * 0.18, y: h * 0.7 },
      { x: w * 0.82, y: h * 0.7 },
    ]

    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const origin = origins[i % origins.length]
      const central = i % origins.length === 0
      const angle = central
        ? Math.random() * Math.PI * 2
        : -Math.PI / 2 + (origin.x < w / 2 ? 0.35 : -0.35) + (Math.random() - 0.5) * 0.9
      const speed = (central ? 5 : 9) + Math.random() * (central ? 9 : 8)
      const maxLife = 110 + Math.random() * 70
      return {
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (central ? 3 : 0),
        size: 4 + Math.random() * 6,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.35,
        color: palette[i % palette.length],
        shape: (i % 3) as 0 | 1 | 2,
        life: 0,
        maxLife,
      }
    })

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      let alive = 0
      for (const p of particles) {
        if (p.life >= p.maxLife) continue
        alive++
        p.life++
        p.vx *= 0.985
        p.vy = p.vy * 0.985 + 0.22
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.spin
        const fade = 1 - Math.max(0, (p.life - p.maxLife * 0.6) / (p.maxLife * 0.4))
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else if (p.shape === 1) {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(0, -p.size / 2)
          ctx.lineTo(p.size / 2, p.size / 2)
          ctx.lineTo(-p.size / 2, p.size / 2)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()
      }
      if (alive > 0) frame = requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, w, h)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [burstKey, reduceMotion, colors])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60] size-full"
      aria-hidden="true"
    />
  )
}
