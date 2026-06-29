import type { ReactNode } from 'react'

type SectionCardProps = {
  number: string
  title: string
  description: string
  children: ReactNode
}

export function SectionCard({ number, title, description, children }: SectionCardProps) {
  return (
    <article className="rounded-lg border border-[#bbc8cf]/80 bg-white/90 p-4 shadow-panel">
      <div className="flex items-center gap-2.5">
        <span className="flex size-[29px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#22c5bd] to-[#f5a623] text-[10px] font-extrabold text-[#101820]">
          {number}
        </span>
        <div>
          <h3 className="m-0 text-sm font-bold text-forest-700">{title}</h3>
          <p className="mt-[3px] text-[11px] text-[#63727a]">{description}</p>
        </div>
      </div>
      {children}
    </article>
  )
}
