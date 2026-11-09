import { memo, type CSSProperties, type KeyboardEvent, type Ref } from 'react'
import { Check } from 'lucide-react'
import type { Technology } from '../types/game'
import { TechIcon } from './TechIcon'

interface MemoryCardProps {
  tech: Technology
  index: number
  flipped: boolean
  matched: boolean
  mismatch?: boolean
  missed?: boolean
  /** `false` = card decorativo (demonstração da tela inicial). */
  interactive?: boolean
  locked?: boolean
  onSelect?: (index: number) => void
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void
  buttonRef?: Ref<HTMLButtonElement>
  compact?: boolean
}

function CardFaces({ tech, matched, compact }: Pick<MemoryCardProps, 'tech' | 'matched' | 'compact'>) {
  return (
    <span className="mcard-inner block">
      <span className="mcard-face mcard-back grid place-items-center">
        <svg
          viewBox="0 0 40 24"
          className={`mcard-glyph ${compact ? 'w-[38%]' : 'w-[42%]'}`}
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4 3 12l8 8M29 4l8 8-8 8M23 3l-6 18" />
        </svg>
      </span>
      <span
        className="mcard-face mcard-front flex flex-col items-center justify-center gap-[8%] px-1"
        style={{ '--tech': tech.color } as CSSProperties}
      >
        <TechIcon tech={tech} className={compact ? 'w-[40%]' : 'w-[42%] max-w-20'} />
        {!compact && (
          <span className="max-w-full truncate font-mono text-[clamp(0.55rem,1.6vw,0.75rem)] leading-none tracking-tight text-muted">
            {tech.name}
          </span>
        )}
        {matched && (
          <span className="absolute top-[7%] right-[7%] grid size-[clamp(0.9rem,3vw,1.25rem)] place-items-center rounded-full bg-ok text-ink">
            <Check className="size-[70%]" strokeWidth={3.2} aria-hidden="true" />
          </span>
        )}
      </span>
    </span>
  )
}

export const MemoryCard = memo(function MemoryCard({
  tech,
  index,
  flipped,
  matched,
  mismatch = false,
  missed = false,
  interactive = true,
  locked = false,
  onSelect,
  onKeyDown,
  buttonRef,
  compact = false,
}: MemoryCardProps) {
  const dataAttrs = {
    'data-flipped': String(flipped),
    'data-matched': String(matched),
    'data-mismatch': String(mismatch),
    'data-missed': String(missed),
    'data-interactive': String(interactive && !locked && !flipped),
  }

  if (!interactive) {
    return (
      <div className="mcard" aria-hidden="true" {...dataAttrs}>
        <CardFaces tech={tech} matched={matched} compact={compact} />
      </div>
    )
  }

  const label = matched
    ? `${tech.name}, par encontrado`
    : flipped
      ? `${tech.name}, virado`
      : `Card ${index + 1}, virado para baixo`

  return (
    <button
      ref={buttonRef}
      type="button"
      className="mcard"
      aria-label={label}
      aria-disabled={matched || flipped || locked}
      onClick={() => onSelect?.(index)}
      onKeyDown={(event) => onKeyDown?.(event, index)}
      {...dataAttrs}
    >
      <CardFaces tech={tech} matched={matched} compact={compact} />
    </button>
  )
})
