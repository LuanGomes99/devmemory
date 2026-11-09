import { useId, useState, type FormEvent, type Ref } from 'react'
import { AlertCircle, Play } from 'lucide-react'
import { NAME_MAX_LENGTH, sanitizeName } from '../utils/ranking'

interface PlayerFormProps {
  defaultName: string
  onStart: (name: string) => void
  inputRef?: Ref<HTMLInputElement>
}

export function PlayerForm({ defaultName, onStart, inputRef }: PlayerFormProps) {
  const [value, setValue] = useState(defaultName)
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()
  const errorId = useId()
  const length = Array.from(value).length

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = sanitizeName(value)
    if (!name) {
      setError('Digite um nome ou nickname para começar.')
      event.currentTarget.querySelector('input')?.focus()
      return
    }
    setValue(name)
    onStart(name)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg">
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-muted">
        Como você quer aparecer no ranking?
      </label>
      <div
        className={`flex flex-col gap-2 rounded-2xl border bg-panel/80 p-2 backdrop-blur transition-colors focus-within:border-accent/60 sm:flex-row ${
          error ? 'border-danger/60' : 'border-line-strong/70'
        }`}
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={value}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="nickname"
            autoCapitalize="words"
            spellCheck={false}
            enterKeyHint="go"
            placeholder="Digite seu nome ou nickname"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setValue(event.target.value)
              if (error) setError(null)
            }}
            className="h-12 w-full rounded-xl bg-transparent pr-14 pl-3 text-base text-fg placeholder:text-faint focus:outline-none"
          />
          <span
            className={`pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[0.7rem] tabular-nums ${
              length >= NAME_MAX_LENGTH ? 'text-warn' : 'text-faint'
            }`}
            aria-hidden="true"
          >
            {length}/{NAME_MAX_LENGTH}
          </span>
        </div>
        <button
          type="submit"
          className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-[0.95rem] font-semibold text-ink shadow-[0_10px_30px_-12px_var(--color-accent)] transition-[filter,transform,box-shadow] hover:brightness-110 hover:shadow-[0_14px_40px_-12px_var(--color-accent)] active:scale-[0.98]"
        >
          <Play className="size-4 fill-current transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          Começar desafio
        </button>
      </div>
      <p
        id={errorId}
        role="alert"
        className={`mt-2 flex min-h-5 items-center gap-1.5 text-sm text-danger ${error ? '' : 'invisible'}`}
      >
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        {error ?? ' '}
      </p>
    </form>
  )
}
