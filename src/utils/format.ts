const numberFormat = new Intl.NumberFormat('pt-BR')
const secondsFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatNumber = (value: number) => numberFormat.format(value)

/** 42318 ms → "42,3 s" (arredonda para o décimo mais próximo, igual em todas as telas). */
export const formatSeconds = (ms: number) => `${secondsFormat.format(Math.round(ms / 100) / 10)} s`

export const formatDate = (epoch: number) => dateFormat.format(new Date(epoch))
