type ConditionCardProps = {
  formula: string
  values: string
  isMet: boolean
}

export function ConditionCard({ formula, values, isMet }: ConditionCardProps) {
  return (
    <article className={`rounded-lg border border-l-[3px] p-[13px_14px] shadow-panel ${isMet ? 'border-[#d9e4e7] border-l-[#22c5bd] bg-white' : 'border-[#f2d7a9] border-l-[#f5a623] bg-[#fff7ed]'}`}>
      <span className="block text-[10px] font-extrabold tracking-[.5px] text-[#63727a]">
        {formula}
      </span>
      <strong className={`mt-1.5 block text-[13px] ${isMet ? 'text-forest-600' : 'text-[#8a5a16]'}`}>
        {isMet ? 'Warunek spełniony' : 'Warunek niespełniony'}
      </strong>
      <p className="mt-1 text-[11px] text-[#63727a]">{values}</p>
    </article>
  )
}
