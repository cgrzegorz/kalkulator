import { formatNumber } from '../format'

type FormulaCardProps = {
  name: string
  calculatedCurrent: number
}

export function FormulaCard({ name, calculatedCurrent }: FormulaCardProps) {
  return (
    <aside className="rounded-lg border border-[#bfe4e2] bg-[#eef7f7] p-4 shadow-panel">
      <span className="block text-[9px] font-extrabold uppercase tracking-[.7px] text-[#63727a]">
        Prąd pobierany przez {name || 'rozdzielnicę'}
      </span>
      <div className="my-[25px] flex items-center justify-center gap-2 font-serif text-lg text-[#17202a]">
        <i>I<sub>n</sub></i>
        <b>=</b>
        <span className="flex flex-col text-center leading-tight">
          <i className="border-b border-[#17202a]">P<sub>s</sub> × 1000</i>
          <i>√3 × U × cosφ</i>
        </span>
      </div>
      <strong className="block text-center text-[26px] tracking-[-.8px] text-forest-600">
        {formatNumber(calculatedCurrent)} <small className="text-[11px] text-[#63727a]">A</small>
      </strong>
      <p className="mt-1.5 text-center text-[11px] leading-normal text-[#63727a]">
        Wynik aktualizuje się automatycznie na podstawie bilansu.
      </p>
    </aside>
  )
}
