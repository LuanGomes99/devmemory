import type { Technology } from '../types/game'

interface TechIconProps {
  tech: Technology
  className?: string
}

/** Logotipo da tecnologia em SVG local (sem dependência de rede). */
export function TechIcon({ tech, className }: TechIconProps) {
  if (tech.path === null) {
    // C#: hexágono + monograma, desenhado localmente (não existe no Simple Icons).
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="M12 .8l9.7 5.6v11.2L12 23.2 2.3 17.6V6.4z" fill={tech.color} />
        <path
          d="M12 3.1l7.7 4.45v8.9L12 20.9l-7.7-4.45v-8.9z"
          fill="none"
          stroke="rgb(255 255 255 / 0.22)"
          strokeWidth=".6"
        />
        <text
          x="12"
          y="15.4"
          textAnchor="middle"
          fontSize="8.6"
          fontWeight="700"
          fontFamily="'Space Grotesk Variable', system-ui, sans-serif"
          fill="#fff"
          letterSpacing="-.2"
        >
          C#
        </text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d={tech.path} fill={tech.color} />
    </svg>
  )
}
