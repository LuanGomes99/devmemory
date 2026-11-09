import type { ReactNode } from 'react'
import { PAIR_COUNT, TIME_LIMIT_MS } from '../hooks/useMemoryGame'

/** As regras do desafio apresentadas como um objeto de configuração. */
export function ChallengeSpec() {
  const rows: { key: string; value: ReactNode; comment?: string }[] = [
    { key: 'tempo', value: <Num>{TIME_LIMIT_MS / 1000}</Num>, comment: 'segundos, sem pausa' },
    { key: 'pares', value: <Num>{PAIR_COUNT}</Num>, comment: `${PAIR_COUNT * 2} cards no tabuleiro` },
    { key: 'objetivo', value: <Str>combinar todas as tecnologias</Str> },
    { key: 'ranking', value: <Str>top 10 neste navegador</Str> },
  ]

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-ink-2/80 backdrop-blur">
      <figcaption className="sr-only">
        Regras: {TIME_LIMIT_MS / 1000} segundos de tempo limite, {PAIR_COUNT} pares, objetivo de
        combinar todas as tecnologias, ranking com os 10 melhores deste navegador.
      </figcaption>
      <pre
        className="overflow-x-auto px-4 py-3.5 font-mono text-[0.72rem] leading-[1.75] sm:text-[0.8rem]"
        aria-hidden="true"
      >
        <code>
          <span className="text-syn-key">const</span> <span className="text-fg">desafio</span>{' '}
          <span className="text-faint">=</span> <span className="text-faint">{'{'}</span>
          {'\n'}
          {rows.map((row) => (
            <span key={row.key}>
              {'  '}
              <span className="text-syn-prop">{row.key}</span>
              <span className="text-faint">: </span>
              {row.value}
              <span className="text-faint">,</span>
              {row.comment && <span className="text-faint">{'  '}// {row.comment}</span>}
              {'\n'}
            </span>
          ))}
          <span className="text-faint">{'}'}</span>
        </code>
      </pre>
    </figure>
  )
}

function Num({ children }: { children: ReactNode }) {
  return <span className="text-syn-num">{children}</span>
}

function Str({ children }: { children: ReactNode }) {
  return <span className="text-syn-str">"{children}"</span>
}
