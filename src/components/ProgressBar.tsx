import { motion } from 'motion/react'

interface ProgressBarProps {
  value: number
  max: number
  label: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const ratio = max === 0 ? 0 : value / max
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="relative h-1.5 w-full overflow-hidden rounded-full bg-line"
    >
      {/* Marcas de cada par */}
      <div className="absolute inset-0 z-10 flex" aria-hidden="true">
        {Array.from({ length: max - 1 }, (_, i) => (
          <span key={i} className="flex-1 border-r-2 border-ink-2" />
        ))}
        <span className="flex-1" />
      </div>
      <motion.div
        className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-ok"
        initial={false}
        animate={{ scaleX: ratio }}
        transition={{ type: 'spring', stiffness: 160, damping: 22 }}
      />
    </div>
  )
}
