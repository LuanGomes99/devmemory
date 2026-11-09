import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { formatNumber } from '../utils/format'

export function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(reduceMotion ? value : 0)

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      delay: 0.25,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [value, duration, reduceMotion])

  return <>{formatNumber(display)}</>
}
