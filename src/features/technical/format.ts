export function toNumber(value: string) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits }).format(value)
}

export function formatInputNumber(value: number, maximumFractionDigits = 2) {
  return Number.isFinite(value)
    ? Number(value.toFixed(maximumFractionDigits)).toString()
    : ''
}
