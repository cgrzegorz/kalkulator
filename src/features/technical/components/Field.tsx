type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  unit?: string
}

export function Field({ label, value, onChange, unit }: FieldProps) {
  return (
    <label>
      <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[.55px] text-[#63727a]">
        {label}
      </span>
      <div className="relative">
        <input
          className="h-9 w-full rounded-md border border-[#ccd7db] bg-[#fbfcfc] px-2.5 pr-9 text-xs text-[#1d2935] outline-none focus:border-[#22c5bd] focus:shadow-[0_0_0_3px_rgba(34,197,189,.16)]"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
        {unit && (
          <b className="absolute right-2.5 top-2.5 text-[10px] text-[#63727a]">
            {unit}
          </b>
        )}
      </div>
    </label>
  )
}
